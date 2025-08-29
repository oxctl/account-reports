import React, { useState } from "react";
import { Button } from "@instructure/ui-buttons";
import { Spinner } from "@instructure/ui-spinner";
import { Link } from "@instructure/ui-link";

// --- ReportAction as a function component ---
function ReportAction({ name, report, addAlert }) {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const reportRef = React.useRef(null);

  const run = async () => {
    try {
      setRunning(true);
      setComplete(false);
      reportRef.current = report();
      await reportRef.current.run();
      setComplete(true);
      addAlert({ variant: "success", message: `${name} report is complete.` });
    } catch (e) {
      console.log("Exception chucked in a fit ==> " + e);
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
    const aTag = document.createElement("a");
    const file = new Blob([reportRef.current.output()], { type: "text/csv" });
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
