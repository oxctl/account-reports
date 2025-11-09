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
    // Capture the Canvas API base URL (passed in via options.baseUrl from App)
    this.canvasBaseUrl = mergedOptions.baseUrl || null;
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

    // Determine expected role id from environment (ENROL_REPORT_1 is expected
    // to be an array like ["Suspended Students", 129]). We support several
    // env locations so this works both in local env files and when built.
    let expectedRoleId = "111"; // fallback
    try {
      let rawEnv = null;
      if (typeof process !== "undefined" && process.env && process.env.ENROL_REPORT_1) {
        rawEnv = process.env.ENROL_REPORT_1;
      } else {
        try {
          // import.meta.env is available in Vite-built code. Access it inside a try
          // block so environments that don't support import.meta won't throw at parse time.
          rawEnv = (import.meta && import.meta.env && (import.meta.env.ENROL_REPORT_1 || import.meta.env.VITE_ENROL_REPORT_1)) || null;
        } catch (e) {
          rawEnv = null;
        }
      }
      if (rawEnv) {
        // rawEnv may be a JSON-like string (e.g. '["Suspended Students",129]')
        let parsed = null;
        try {
          parsed = JSON.parse(rawEnv);
        } catch (e) {
          // Try to coerce an unquoted number or similar into JSON by string replacement
          try {
            const cleaned = String(rawEnv).replace(/'/g, '"');
            parsed = JSON.parse(cleaned);
          } catch (e2) {
            // last resort: attempt to eval the array form safely by extracting numbers
            const nums = String(rawEnv).match(/\d+/g);
            if (nums && nums.length >= 1) {
              // assume the second numeric value is the role id
              parsed = [null, Number(nums[nums.length - 1])];
            }
          }
        }
        if (parsed && Array.isArray(parsed) && parsed.length > 1) {
          expectedRoleId = String(parsed[1]);
        }
      }
    } catch (e) {
      // keep fallback
    }

    // Find rows where the F column (index 5) equals the expected role id
    // AND the 9th column (index 8) equals 'active'. If either condition
    // fails for a row, it will be ignored.
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // row may be shorter; guard against that
      const col6 = row && row.length > 5 ? String(row[5]).trim() : "";
      const col9 = row && row.length > 8 ? String(row[8]).trim() : "";
      if (col6 === expectedRoleId && col9 === "active") {
        matches.push(row);
      }
    }

    // Keep only the first 5 columns, then remove duplicate rows while
    // preserving the original header as the first row.
    const trimmed = matches.map((r) => (Array.isArray(r) ? r.slice(0, 5) : r));

    const seen = new Set();
    const unique = [];
    if (trimmed.length > 0) {
      unique.push(trimmed[0]); // header
    }
    for (let i = 1; i < trimmed.length; i++) {
      const row = trimmed[i];
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    }

    // Prepend canvasBaseUrl/courses/ to the first column for each data row (leave header unchanged)
    const hostBase = (this.canvasBaseUrl || "").replace(/\/$/, "");
    const withHost = unique.map((row, idx) => {
      if (idx === 0) return row;
      const id = row && row.length > 0 ? String(row[0]).trim() : "";
      const newFirst = id ? `${hostBase}/courses/${id}/users` : "";
      const newRow = Array.isArray(row) ? [...row] : [row];
      newRow[0] = newFirst;
      return newRow;
    });

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

export default SuspendedStudentsJob;
