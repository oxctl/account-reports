import React, { useRef, useState } from "react";
import { Button, Link, Spinner } from "@instructure/ui";

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
  // Track whether the report is currently running
  const [running, setRunning] = useState(false);
  // Track whether the report finished successfully
  const [complete, setComplete] = useState(false);
  // Keep a ref to the report object instance so we can call output() later
  const reportRef = useRef(null);

  /**
   * Run the report, update state, and handle success/failure.
   */
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

  /**
   * Generate a filename for the CSV download.
   */
  const filename = () =>
    name.toLowerCase().replaceAll(" ", "_") +
    "-" +
    new Date().toJSON().slice(0, 16).replaceAll(":", "-") +
    ".csv";

  /**
   * Trigger a CSV download of the report output.
   */
  const download = () => {
    const file = new Blob([reportRef.current.output()], { type: "text/csv" });
    const aTag = document.createElement("a");
    aTag.href = URL.createObjectURL(file);
    aTag.download = filename();
    aTag.click();
  };

  return (
    <>
      {/* Run button (disabled if already running) */}
      <Button
        onClick={run}
        interaction={running ? "disabled" : "enabled"}
        margin="none small"
      >
        Run
      </Button>

      {/* Show spinner if running, otherwise show Download link if complete */}
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
