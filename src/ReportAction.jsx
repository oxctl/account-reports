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
function ReportAction({ name, report, addAlert, onRunStart }) {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const reportRef = useRef(null);

  const run = async () => {
    // notify parent that a run started; swallow errors from parent
    try {
      if (onRunStart) onRunStart();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("onRunStart callback error", err);
    }

    

    try {
      setRunning(true);
      setComplete(false);

      reportRef.current = report();
      await reportRef.current.run();

      setComplete(true);
      addAlert({ variant: "success", message: `${name} report is complete.` });
    } catch (e) {
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

  const filename = () =>
    name.toLowerCase().replaceAll(" ", "_") +
    "-" +
    new Date().toJSON().slice(0, 16).replaceAll(":", "-") +
    ".csv";

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
