import ReportApi from "./ReportApi";
import * as Papa from "papaparse";

/**
 * SuspendedStudentsJob
 *
 * This job looks for suspended students in the account using the provisioning
 * CSV. It is a straightforward copy of DuplicateLoginsJob but renamed so it
 * can be implemented or extended separately in future.
 */
class SuspendedStudentsJob {
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
    const mergedOptions = { ...SuspendedStudentsJob.defaultOpts, ...options };
    this.accountId = mergedOptions.accountId;
    this.statusUpdate = mergedOptions.statusUpdate;
  }

  run = async () => {
    const reportApi = new ReportApi(this.host, this.token);
    this.statusUpdate("Running suspended students report");
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
    const parsed = Papa.parse(reportCsv, {
      delimiter: ",",
      header: false,
      skipEmptyLines: true,
    });

    const data = parsed.data || [];
    if (data.length === 0) {
      this.csv = "";
      this.statusUpdate("No data in CSV");
      return;
    }

    // Keep the original header row as the first row in the output
    const headerRow = data[0];
    const matches = [headerRow];

    // Find rows where the 6th column (index 5) equals '129'
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // row may be shorter; guard against that
      const col6 = row && row.length > 5 ? String(row[5]).trim() : "";
      if (col6 === "129") {
        matches.push(row);
      }
    }

    // Unparse the selected rows back to CSV. We supply header: false because
    // we've manually included the header row as the first entry.
    this.csv = Papa.unparse(matches, { header: false });
    this.statusUpdate("Written CSV");
  };

  output = () => {
    return this.csv;
  };
}

export default SuspendedStudentsJob;
