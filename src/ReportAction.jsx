import React, { useState, useRef } from "react";
import { Button } from "@instructure/ui-buttons";
import { Spinner } from "@instructure/ui-spinner";
import { Link } from "@instructure/ui-link";

/**
 * A UI component that runs a report and allows the result to be downloaded.
 *
 * @component
 * @param {string} name - Short display name of the report.
 * @param {Function} report - Function that creates the report instance. The returned
 *   object must expose run() which performs the report and output() which returns
 *   the CSV string for download.
 * @param {Function} addAlert - Callback to display status messages (e.g. success/error).
 * @param {Function} [onRunStart] - Optional callback invoked when the Run action
 *   begins. This can be used by the parent to show a persistent warning or update
 *   UI state when background work starts. Errors thrown by this callback are
 *   swallowed to avoid breaking the report run.
 * @returns {JSX.Element} The rendered report action buttons (Run + Download).
 */
function ReportAction({ name, report, addAlert, onRunStart }) {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const reportRef = useRef(null);

  const run = async () => {
    // Notify parent that a run started. The parent may show a persistent
    // warning (for example: "do not change tabs until downloads complete").
    // Swallow any errors from the parent callback so the report run still
    // proceeds even if the parent's handler throws.
    try {
      if (onRunStart) onRunStart();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("onRunStart callback error", err);
    }

    try {
      // Mark running state and clear any previous completion marker
      setRunning(true);
      setComplete(false);

      // Create the report instance and run it. The report object is expected
      // to implement a run() promise and an output() method that returns the
      // final CSV content.
      reportRef.current = report();
      await reportRef.current.run();

      // Mark complete and notify user via addAlert
      setComplete(true);
      addAlert({ variant: "success", message: `${name} report is complete.` });
    } catch (e) {
      // Report run failed; log and surface an error alert
      // eslint-disable-next-line no-console
      console.error("Report run failed", e);
      addAlert({
        variant: "error",
        message: `${name} report failed to complete.`,
      });
    } finally {
      setRunning(false);
    }
  };

  // Generate a filename for the downloaded CSV. Example: multiple_login_users-2025-10-16T18-50.csv
  const filename = () =>
    name.toLowerCase().replaceAll(" ", "_") +
    "-" +
    new Date().toJSON().slice(0, 16).replaceAll(":", "-") +
    ".csv";

  // Create a Blob from the report output and trigger a client-side download
  // using an anchor element and URL.createObjectURL.
  const download = () => {
    const file = new Blob([reportRef.current.output()], { type: "text/csv" });
    const aTag = document.createElement("a");
    aTag.href = URL.createObjectURL(file);
    aTag.download = filename();
    aTag.click();
  };

  return (
    <>
      <Button
        onClick={run}
        interaction={running ? "disabled" : "enabled"}
        margin="none small"
      >
        Run
      </Button>
      {running ? (
        <Spinner size="x-small" renderTitle="running" />
      ) : (
        complete && (
          <Link href="#" onClick={download}>
            Download
          </Link>
        )
      )}
    </>
  );
}

export default ReportAction;
