import ReportApi from "./ReportApi";
import * as Papa from "papaparse";

/**
 * RoleMatchJob
 *
 * Generic job that finds rows in the provisioning CSV that match a given
 * role id in column F (6th column, index 5) and outputs a CSV of Canvas Course URL + User ID + Role.
 */
class RoleMatchJob {
  // The account ID to run the report against.
  accountId = null;
  // Function to call with status updates.
  statusUpdate = () => {};
  // The CSV contents when built.
  csv = null;

  static defaultOpts = {
    accountId: "self",
    statusUpdate: () => {},
  };

  constructor(host, token, options = {}) {
    this.host = host;
    this.token = token;
    const { accountId, statusUpdate, baseUrl, roleId } = {
      ...RoleMatchJob.defaultOpts,
      ...options,
    };
    this.accountId = accountId;
    this.statusUpdate = statusUpdate;
    // Capture the Canvas API base URL (passed in via options.baseUrl from App)
    this.canvasBaseUrl = baseUrl || null;
    // Role id may be passed in via options when multiple reports are configured
    this.roleId = roleId || null;
  }

  run = async () => {
    const reportApi = new ReportApi(this.host, this.token);
    this.statusUpdate("Running role match report");
    const report = await reportApi.runReport(
      "provisioning_csv",
      { enrollments: "true" },
      { account: this.accountId },
    );
    this.statusUpdate("Downloading report");
    const attachment = await reportApi.fetchReport(report);
    this.statusUpdate("Building CSV");
    const reportCsv = await attachment.text();

    // Parse without headers so we can inspect columns by index.
    const { data } = Papa.parse(reportCsv, {
      delimiter: ",",
      header: false,
      skipEmptyLines: true,
    });

    if (!data || data.length === 0) {
      this.csv = "";
      this.statusUpdate("No data in CSV");
      return;
    }

    // Use role id passed via options (this.roleId). If absent, stop early.
    const expectedRoleId = this.roleId ? String(this.roleId) : null;
    if (!expectedRoleId) {
      this.csv = "";
      this.statusUpdate("No role ID set");
      return;
    }

    // Process rows (skip header at index 0):
    // 1) filter rows by role id (col 6) and active status (col 9)
    // 2) trim to first 5 columns
    // 3) deduplicate while preserving order
    const rows = (data || []).slice(1);

    const filtered = rows
      .filter((row) => {
        const col6 = Array.isArray(row) && row.length > 5 ? String(row[5]).trim() : "";
        const col9 = Array.isArray(row) && row.length > 8 ? String(row[8]).trim() : "";
        return col6 === String(expectedRoleId) && col9 === "active";
      })
      .map((r) => (Array.isArray(r) ? r.slice(0, 5) : []));

    const seen = new Set();
    const unique = filtered.reduce((acc, row) => {
      const key = Array.isArray(row) ? row.join("|") : String(row);
      if (!seen.has(key)) {
        seen.add(key);
        acc.push(row);
      }
      return acc;
    }, []);

    // Prepend canvasBaseUrl/courses/ to the first column for each data row (leave header unchanged) append /users.
    const hostBase = (this.canvasBaseUrl || "").replace(/\/$/, "");
    const withHost = unique.map((row, idx) => {
      if (idx === 0) return row;
      if (!Array.isArray(row)) {
        // Skip non-array rows (return null, will be filtered out)
        return null;
      }
      const id = row.length > 0 ? String(row[0]).trim() : "";
      const newFirst = id ? `${hostBase}/courses/${id}/users` : "";
      const newRow = [...row];
      newRow[0] = newFirst;
      return newRow;
    }).filter(row => row !== null);

    // Build final output with three columns: Canvas Course URL (A), User ID (D), and Role (E).
    // Replace the header row with the desired headings.
    const finalRows = [];
    finalRows.push(["Canvas Course URL", "User ID", "Role"]);
    for (let i = 1; i < withHost.length; i++) {
      const row = withHost[i];
      const courseUrl = row && row.length > 0 ? String(row[0]).trim() : "";
      // Original D column is index 3 in the trimmed rows
      const userId = row && row.length > 3 ? String(row[3]).trim() : "";
      // Original E column (Role) is index 4 in the trimmed rows
      const role = row && row.length > 4 ? String(row[4]).trim() : "";
      finalRows.push([courseUrl, userId, role]);
    }

    // Unparse final rows back to CSV. header:false because we include the header manually.
    this.csv = Papa.unparse(finalRows, { header: false });
    this.statusUpdate("Written CSV");
  };

  output = () => {
    return this.csv;
  };
}

export default RoleMatchJob;
