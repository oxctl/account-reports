import ReportApi from "./ReportApi";
import { JobsMixin } from "./JobsMixin";

/**
 * Produces a list of user access tokens for the root account that are older than a year or expire more than a year from now.
 */
class UserAccessTokensCSVJob {
  static defaultOpts = {
    accountId: "self",
    statusUpdate: () => {},
  };
  accountId = null;
  csv = null;

  constructor(host, token, options = {}) {
    this.host = host;
    this.token = token;

    const mergedOptions = { ...UserAccessTokensCSVJob.defaultOpts, ...options };
    this.accountId = mergedOptions.accountId;
    this.statusUpdate = mergedOptions.statusUpdate;
    this.baseUrl = mergedOptions.baseUrl;
    this.rootAccountId = mergedOptions.rootAccountId;
  }

  run = async () => {
    try {
      const reportApi = new ReportApi(this.host, this.token);
      const accountId = this.rootAccountId || this.accountId;

      this.statusUpdate("Running reports");
      const [adminsReport, tokensReport] = await Promise.all([
        reportApi.runReport(
          "provisioning_csv",
          { admins: "true" },
          { account: accountId },
        ),
        reportApi.runReport("user_access_tokens_csv", {
          account: accountId,
          exclude_deleted_and_expired: "1",
          include_deleted: "1",
        }),
      ]);

      this.statusUpdate("Downloading reports");
      const [adminsCsv, tokensCsv] = await Promise.all([
        reportApi.fetchReport(adminsReport).then((report) => report.text()),
        reportApi.fetchReport(tokensReport).then((report) => report.text()),
      ]);

      this.statusUpdate("Building CSV");
      this.adminsRows = await this.parseCsv(adminsCsv);
      const tokenRows = await this.parseCsv(tokensCsv);

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const tokensByUserId = new Map();
      for (const token of Object.values(tokenRows)) {
        const reasons = [];

        if (token.status?.toLowerCase() !== "active") continue;
        if (token.dev_key_name !== 'User-Generated') continue;

        const createdAt =
          token.creation && token.creation !== "never"
            ? new Date(token.creation)
            : null;
        const expiresAt =
          token.expiration && token.expiration !== "never"
            ? new Date(token.expiration)
            : null;

        if (createdAt?.getTime() > oneYearAgo.getTime())
          reasons.push("Created within last year");
        if (expiresAt?.getTime() > oneYearAgo.getTime())
          reasons.push("Expires over a year from now");
        if (token.expiration === "never") reasons.push("Never expires");

        if (reasons.length === 0) continue;

        token.reason = reasons.join("; ");
        const userId = String(token.user_id || "");
        if (!tokensByUserId.has(userId)) tokensByUserId.set(userId, []);
        tokensByUserId.get(userId).push(token);
      }

      const output = Object.values(this.adminsRows)
        .filter(
          (admin) => String(admin.canvas_account_id) === String(accountId),
        )
        .flatMap((admin) => {
          const adminUserId = String(admin.canvas_user_id || "");
          return (tokensByUserId.get(adminUserId) || []).map((token) => ({
            "Admin User ID": adminUserId,
            "Admin Name": admin.admin_user_name || "",
            "Account ID": admin.canvas_account_id || "",
            "Token ID": token.id || token.token_id || "",
            "Token Status": token.status || "",
            "Created At": token.creation || "",
            "Expires At": token.expiration || "",
            "Last Used At": token.last_used || "",
            "Reason Included": token.reason || "",
          }));
        });

      this.csv = this.toCsv(output);
    } catch (e) {
      console.log(e);
      throw e;
    }

    this.statusUpdate("Written CSV");
  };

  output = () => this.csv;
}

Object.assign(UserAccessTokensCSVJob.prototype, JobsMixin);

export default UserAccessTokensCSVJob;
