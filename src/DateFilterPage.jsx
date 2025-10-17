import React, { useEffect, useState, useRef } from "react";

import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { DateTimeInput } from "@instructure/ui-date-time-input";
import { ScreenReaderContent } from "@instructure/ui-a11y-content";
import { IconXSolid } from "@instructure/ui-icons";
import { Flex } from "@instructure/ui-flex";
import { IconButton, Button } from "@instructure/ui-buttons";

import { SisImportListItem } from "./SisImportListItem";
import { Loading } from "./Loading";
import { handleResponseFailure } from "./utils/handleResponseFailure";

/**
 * Renders the Provisioning Reports page for a Canvas account.
 *
 * @function ProvisioningReportsPage
 * @param {string} token - API token used for authenticating requests.
 * @param {string} server - Base server URL for the Canvas instance.
 * @param {string|number} accountId - The Canvas account ID to run the reports against.
 * @param {Function} handle40x - Callback to handle 40x (Forbidden) errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered Provisioning Reports page.
 */
function DateFilterPage({ token, server, accountId, handle40x }) {
  // The SIS import object
  const [sisImport, setSisImport] = useState(null);
  // The API URL for the current search
  const [sisImportUrl, setSisImportUrl] = useState();
  // Error message to display (if any)
  const [sisError, setSisError] = useState(null);
  // Date/time inputs for the filter range
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  // Ref for focusing controls
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  // Hide results when errors occur or when inputs are cleared
  const [hideResults, setHideResults] = useState(false);
  // Whether the search is currently loading
  const [loading, setLoading] = useState(false);

  /**
   * Build the "error message" format for Instructure UI.
   */
  const missingImportMessage = () => {
    if (sisError) {
      return [{ type: "newError", text: sisError }];
    }
  };

  /**
   * When `sisImportUrl` changes, fetch the data.
   */
  useEffect(() => {
    if (!token || !sisImportUrl) return;

    fetch(sisImportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setHideResults(true);
        setLoading(false);

        if (!response.ok) {
          handleResponseFailure(response, handle40x);
        } else {
          setHideResults(false);
        }
        return response.json();
      })
      .then(setSisImport)
      .catch((err) => {
        setLoading(false);
        setSisError(err.message + " There is no SIS Import with that ID ");
        setHideResults(true);
      });
  }, [token, sisImportUrl]);

  // Validate that the before/after pair is chronological. If one is blank we
  // treat it as now when building the query.
  const isChronological = () => {
    const now = new Date();
    const beforeDate = before ? new Date(before) : now;
    const afterDate = after ? new Date(after) : now;
    return afterDate <= beforeDate;
  };

  const handleClear = () => {
    setBefore("");
    setAfter("");
    setLoading(false);
    setSisError(null);
    setHideResults(true);
    beforeRef.current?.focus();
  };

  // Build the query and fetch results (first 100) when user submits
  const handleFilter = (e) => {
    e?.preventDefault();
    setSisError(null);

    if (!isChronological()) {
      setSisError("Start time must be before end time");
      setHideResults(true);
      return;
    }

    setLoading(true);
    setHideResults(true);

    const nowIso = new Date().toISOString();
    const created_since = after ? new Date(after).toISOString() : nowIso;
    const created_until = before ? new Date(before).toISOString() : nowIso;

    const url = `${server}/api/v1/accounts/${accountId}/sis_imports?per_page=100&created_since=${encodeURIComponent(
      created_since,
    )}&created_until=${encodeURIComponent(created_until)}`;

    setSisImportUrl(url);
  };

  return (
    <View as="div" padding="large">
      <Heading variant="titleSection" level="h2">
        Search for SIS Import
      </Heading>

      <form name="dateFilter" onSubmit={handleFilter} autoComplete="off">
        <Flex>
          <Flex.Item shouldGrow>
            <DateTimeInput
              renderLabel={<ScreenReaderContent>SIS imports before</ScreenReaderContent>}
              label="Before"
              description="Show SIS imports run before this date and time"
              datePlaceholder="Choose a date"
              dateRenderLabel="Date"
              timeRenderLabel="Time"
              invalidDateTimeMessage="Invalid date/time"
              prevMonthLabel="Previous month"
              nextMonthLabel="Next month"
              layout="columns"
              value={before}
              onChange={(value) => setBefore(value)}
              inputRef={(el) => (beforeRef.current = el)}
              messages={sisError ? [{ type: "newError", text: sisError }] : []}
            />
          </Flex.Item>

          <Flex.Item shouldGrow>
            <DateTimeInput
              renderLabel={<ScreenReaderContent>SIS imports after</ScreenReaderContent>}
              label="After"
              description="Show SIS imports run after this date and time"
              datePlaceholder="Choose a date"
              dateRenderLabel="Date"
              timeRenderLabel="Time"
              invalidDateTimeMessage="Invalid date/time"
              prevMonthLabel="Previous month"
              nextMonthLabel="Next month"
              layout="columns"
              value={after}
              onChange={(value) => setAfter(value)}
              inputRef={(el) => (afterRef.current = el)}
              messages={sisError ? [{ type: "newError", text: sisError }] : []}
            />
          </Flex.Item>

          <Flex.Item>
            <Button color="primary" margin="0 0 0 small" onClick={handleFilter}>
              Filter
            </Button>
            <Button margin="0 0 0 small" onClick={handleClear}>
              Clear
            </Button>
          </Flex.Item>
        </Flex>
      </form>

      {/* Show loader, or results if available */}
      {loading ? (
        <Loading />
      ) : (
        sisImport &&
        !hideResults && (
          <List>
            <SisImportListItem key={sisImport.id} sisImport={sisImport} />
          </List>
        )
      )}
    </View>
  );
}

export default DateFilterPage;
