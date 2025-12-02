import { checkOk } from "./utils";

/**
 * This is a API on-top of the Canvas report API that runs a report and then polls for it to be complete.
 */
class ReportApi {
  constructor(host, token) {
    this.host = host;
    this.token = token;
  }

  // The default options.
  #defaultOptions = {
    // The account to run the report in
    account: "self",
    // The interval to wait when polling for the report to be complete (ms), default 5 seconds
    interval: 5000,
    // Age of an existing report we might use (ms). Set to 0 to never using existing, default 10 minutes
    reportAge: 1000 * 60 * 10,
    // The timeout on running the report before aborting (ms), default 100 minutes
    timeout: 1000 * 60 * 100,
  };

  runReport = async (reportType, parameters = {}, options = {}) => {
    const { host, token } = this;
    const { account, interval, reportAge, timeout } = {
      ...this.#defaultOptions,
      ...options,
    };

    let report;
    // Only check for old list if we are happy to accept an old report, this should really look over multiple pages
    // but it's unlikely that a recent report is on a subsequent page.
    if (reportAge > 0) {
      report = await fetch(
        `${host}/api/v1/accounts/${account}/reports/${reportType}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      )
        .then(checkOk)
        .then((r) => r.json())
        .then((runs) => {
          let newest = runs
            .filter((run) => run.status === "complete")
            // Check to see that the parameters are the same.
            .filter((run) => this.#equalParameters(run.parameters, parameters))
            // Find the newest one.
            .reduce(
              (newest, run) =>
                Date.parse(run.created_at) > Date.parse(newest.created_at)
                  ? run
                  : newest,
              { created_at: 0 },
            );
          // If it's new enough then use it.
          if (Date.parse(newest.created_at) + reportAge > Date.now()) {
            return newest;
          }
        });
      // If we got an acceptable report return that
      if (report) {
        return report;
      }
    }

    // Generate the report.
    report = await fetch(
      `${host}/api/v1/accounts/${account}/reports/${reportType}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        // We don't want an email to be generated for any of the reports we run as the results are displayed in the UI
        body: JSON.stringify({
          parameters: { ...parameters, skip_message: true },
        }),
      },
    )
      .then(checkOk)
      .then((r) => r.json());

    const reportId = report.id;
    const started = Date.now();
    do {
      await this.#sleep(interval);
      report = await fetch(
        `${host}/api/v1/accounts/${account}/reports/${reportType}/${reportId}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      )
        .then(checkOk)
        .then((r) => r.json());
      // Check to see if the report has taken too long the generate
      if (started + timeout < Date.now()) {
        throw new Error(`Report not finished after waiting ${timeout}ms`);
      }
    } while (!this.#isFinished(report.status));
    if (report.status !== "complete") {
      throw new Error(
        "Report finished but it is not complete, id: " + reportId,
      );
    }
    return report;
  };

  fetchReport(report) {
    return fetch(report.attachment.url).then(checkOk);
  }

  // A sleep promise
  #sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  /**
   * Has a report reached an end state (not going to change).
   * @param status The status
   * @return true if it's finished.
   */
  #isFinished = (status) => {
    const finished = {
      complete: true,
      error: true,
      aborted: true,
      unknown: true,
      created: false,
      running: false,
      compiling: false,
    };
    return finished[status];
  };

  /**
   * Checks to see if the response parameters from a list API call match
   * the requested parameters close enough
   * @param responseParameters The parameters in an API response.
   * @param requestParameters The parameters we are going to make in a request.
   * @return {boolean} true if it's close enough.
   */
  #equalParameters = (responseParameters, requestParameters) => {
    for (const [key, value] of Object.entries(responseParameters)) {
      // We seem to get extra parameters in the response.
      if (key.startsWith("extra_")) {
        continue;
      }
      if (value !== requestParameters[key]) {
        return false;
      }
    }
    // Check to see if request has parameters that aren't in the response
    for (const key of Object.keys(requestParameters)) {
      if (!Object.prototype.hasOwnProperty.call(responseParameters, key)) {
        return false;
      }
    }
    return true;
  };
}

export default ReportApi;
