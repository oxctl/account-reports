import React, { useState, useRef } from "react";
import { Button } from "@instructure/ui-buttons";
import { Spinner } from "@instructure/ui-spinner";
import { Link } from "@instructure/ui-link";

/**
 * A UI component that runs a report and allows the result to be downloaded.
 *
 * @component
 * @param {string} name - Short display name of the report.
 * @param {Function} report - Function that creates the report instance (must expose run() and output()).
 * @param {Function} addAlert - Callback to display status messages (e.g. success/error).
 * @returns {JSX.Element} The rendered report action buttons (Run + Download).
 */
function ReportAction({ name, report, addAlert }) {
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
    try {
      setRunning(true);
      setComplete(false);

      // Create the report instance and start it
      reportRef.current = report();
      await reportRef.current.run();

      // Success!
      setComplete(true);
      addAlert({ variant: "success", message: `${name} report is complete.` });
    } catch (e) {
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
