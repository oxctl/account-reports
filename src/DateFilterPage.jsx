import React, { useEffect, useState, useRef } from "react";

import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { Alert } from "@instructure/ui-alerts";
import { DateTimeInput } from "@instructure/ui-date-time-input";
import { ScreenReaderContent } from "@instructure/ui-a11y-content";
import { IconXSolid } from "@instructure/ui-icons";
import { Flex } from "@instructure/ui-flex";
import { IconButton, Button } from "@instructure/ui-buttons";

import { parseLinkHeader } from "@web3-storage/parse-link-header";

import { AddPagination } from "./AddPagination";
import DateFilterPageToggleGroup from "./DateFilterPageToggleGroup";
import { SisImportListItem } from "./SisImportListItem";
import { Loading } from "./Loading";
import { handleResponseFailure } from "./utils/handleResponseFailure";

/**
 * Renders the SIS Imports date-filter page for a Canvas account.
 *
 * @function DateFilterPage
 * @param {string} token - API token used for authenticating requests.
 * @param {string} server - Base server URL for the Canvas instance.
 * @param {string|number} accountId - The Canvas account ID to run the reports against.
 * @param {Function} handle40x - Callback to handle 40x (Forbidden) errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered page.
 */
function DateFilterPage({ token, server, accountId, handle40x }) {
  // Toggle for showing/hiding date pickers
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  // The SIS import results (array)
  const [sisImports, setSisImports] = useState([]);
  // Pagination state
  const [currentPageUrl, setCurrentPageUrl] = useState();
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  // Error message to display (if any)
  const [sisError, setSisError] = useState(null);
  // Date/time inputs for the filter range (track both iso and timestamps for robust comparisons)
  const [beforeIso, setBeforeIso] = useState("");
  const [afterIso, setAfterIso] = useState("");
  const [beforeTs, setBeforeTs] = useState(null);
  const [afterTs, setAfterTs] = useState(null);
  // Ref for focusing controls
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  // Hide results when errors occur or when inputs are cleared
  const [hideResults, setHideResults] = useState(false);
  // Whether the search is currently loading
  const [loading, setLoading] = useState(false);
  // Force remount of inputs when clearing to reset displayed values
  const [afterResetKey, setAfterResetKey] = useState(0);
  const [beforeResetKey, setBeforeResetKey] = useState(0);
  const rangeErrorText = "Run before must be the same as or after Run after";
  const invalidRange =
    afterTs != null && beforeTs != null && Number(afterTs) > Number(beforeTs);

  useEffect(() => {
    if (invalidRange) {
      setSisError(rangeErrorText);
      setHideResults(true);
    } else if (sisError === rangeErrorText) {
      setSisError(null);
    }
  }, [invalidRange]);

  // Helper to normalize DateTimeInput payloads to { iso, ts }
  const parsePayloadToIsoTs = (payload) => {
    const iso = typeof payload === "object" && payload ? payload.iso : undefined;
    const value = typeof payload === "object" && payload ? payload.value : payload;
    const ts = iso ? Date.parse(iso) : Date.parse(value || "");
    return { iso: iso || "", ts: Number.isNaN(ts) ? null : ts };
  };

  /**
   * When `currentPageUrl` changes, fetch the data and update pagination links.
   */
  useEffect(() => {
    if (!token || !currentPageUrl) return;

    setLoading(true);
    fetch(currentPageUrl, {
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
        const links = parseLinkHeader(response.headers.get("Link"));
        setNextPageUrl(links?.next?.url || null);
        setPrevPageUrl(links?.prev?.url || null);
        return response.json();
      })
      .then((data) => setSisImports(data.sis_imports || []))
      .catch((err) => {
        setLoading(false);
        setSisError(err.message + " There is no SIS Import with that ID ");
        setSisImports([]);
        setHideResults(true);
      });
  }, [token, currentPageUrl]);

  // Validate that the before/after pair is chronological. Only validate when
  // both values are provided; if one or both are blank we allow the filter to
  // proceed and simply omit that parameter from the query string.
  const isChronological = () => {
    if (afterTs != null && beforeTs != null) {
      return Number(afterTs) <= Number(beforeTs);
    }
    return true;
  };


  const clearAfter = () => {
    setAfterIso("");
    setAfterTs(null);
    setAfterResetKey((k) => k + 1);
    setTimeout(() => afterRef.current?.focus(), 0);
  };

  const clearBefore = () => {
    setBeforeIso("");
    setBeforeTs(null);
    setBeforeResetKey((k) => k + 1);
    setTimeout(() => beforeRef.current?.focus(), 0);
  };

  const handleSearchAgain = () => {
    // Reset to initial state to effectively reload the tab
    setLoading(false);
    setSisError(null);
    setSisImports([]);
    setCurrentPageUrl(undefined);
    setBeforeIso("");
    setAfterIso("");
    setBeforeTs(null);
    setAfterTs(null);
    setFiltersExpanded(false);
    setHideResults(true);
    setAfterResetKey((k) => k + 1);
    setBeforeResetKey((k) => k + 1);
    beforeRef.current?.focus();
  };

  // Build the query and fetch the first page of results (per_page=10) when the user submits
  const handleFilter = (e) => {
    e?.preventDefault();
    setSisError(null);

    if (!isChronological()) {
      setSisError(rangeErrorText);
      setHideResults(true);
      return;
    }

    setLoading(true);
    setHideResults(true);

    // Build query parameters and only include created_since / created_before
    // when the corresponding input was filled. It's valid to include neither.
    const params = new URLSearchParams();
    params.set("per_page", "10");
    if (afterIso || afterTs != null) {
      const iso = afterIso || new Date(afterTs).toISOString();
      params.set("created_since", iso);
    }
    if (beforeIso || beforeTs != null) {
      const iso = beforeIso || new Date(beforeTs).toISOString();
      params.set("created_before", iso);
    }

    const url = `${server}/api/v1/accounts/${accountId}/sis_imports?${params.toString()}`;
    setCurrentPageUrl(url);
  };

  return (
    <View as="div" padding="large">
      <Heading variant="titleSection" level="h2">
        Show SIS Imports
      </Heading>

      {sisError && (
        <Alert variant="warning" margin="small 0">
          {sisError}
        </Alert>
      )}

      {/* Show toggle group only when not loading and before any search, or when results are intentionally hidden */}
      {!loading && (!currentPageUrl || hideResults) && (
        <DateFilterPageToggleGroup
          expanded={filtersExpanded}
          setExpanded={setFiltersExpanded}
        >
          {/* Date pickers rendered inside the toggle group */}
          <View as="div" margin="small 0">
            <Flex direction="row" alignItems="end">
              <Flex.Item shouldGrow shouldShrink>
                <DateTimeInput
                  key={`after-${afterResetKey}`}
                  renderLabel={
                    <ScreenReaderContent>SIS imports after</ScreenReaderContent>
                  }
                  label="After"
                  description="Run after"
                  datePlaceholder="Choose a date"
                  dateRenderLabel="Date"
                  timeRenderLabel="Time"
                  invalidDateTimeMessage="Invalid date/time"
                  prevMonthLabel="Previous month"
                  nextMonthLabel="Next month"
                  layout="columns"
                  initialTimeForNewDate="00:00"
                  onChange={(e, payload) => {
                    const { iso, ts } = parsePayloadToIsoTs(payload);
                    setAfterIso(iso);
                    setAfterTs(ts);
                  }}
                  inputRef={(el) => (afterRef.current = el)}
                  messages={
                    sisError ? [{ type: "newError", text: sisError }] : []
                  }
                />
              </Flex.Item>
              <Flex.Item margin="0 0 0 small">
                <IconButton
                  withBackground
                  withBorder
                  size="small"
                  screenReaderLabel="Clear After"
                  onClick={clearAfter}
                >
                  <IconXSolid />
                </IconButton>
              </Flex.Item>
            </Flex>
          </View>

          <View as="div" margin="small 0">
            <Flex direction="row" alignItems="end">
              <Flex.Item shouldGrow shouldShrink>
                <DateTimeInput
                  key={`before-${beforeResetKey}`}
                  renderLabel={
                    <ScreenReaderContent>
                      SIS imports before
                    </ScreenReaderContent>
                  }
                  label="Before"
                  description="Run before"
                  datePlaceholder="Choose a date"
                  dateRenderLabel="Date"
                  timeRenderLabel="Time"
                  invalidDateTimeMessage="Invalid date/time"
                  prevMonthLabel="Previous month"
                  nextMonthLabel="Next month"
                  layout="columns"
                  initialTimeForNewDate="23:59"
                  onChange={(e, payload) => {
                    const { iso, ts } = parsePayloadToIsoTs(payload);
                    setBeforeIso(iso);
                    setBeforeTs(ts);
                  }}
                  inputRef={(el) => (beforeRef.current = el)}
                  messages={
                    sisError ? [{ type: "newError", text: sisError }] : []
                  }
                />
              </Flex.Item>
              <Flex.Item margin="0 0 0 small">
                <IconButton
                  withBackground
                  withBorder
                  size="small"
                  screenReaderLabel="Clear Before"
                  onClick={clearBefore}
                >
                  <IconXSolid />
                </IconButton>
              </Flex.Item>
            </Flex>
          </View>
        </DateFilterPageToggleGroup>
      )}

      <form name="dateFilter" onSubmit={handleFilter} autoComplete="off">
        {/* When results are showing, hide the selectors and show a Search Again button */}
        {loading ? null : sisImports.length > 0 && !hideResults ? (
          <View as="div" margin="small 0">
            <Button
              color="primary"
              margin="0 0 0 small"
              onClick={handleSearchAgain}
            >
              Search Again
            </Button>
          </View>
        ) : (
          <>
            {currentPageUrl && !hideResults && sisImports.length === 0 ? (
              <>
                <View as="div" margin="small 0">
                  No matching SIS Imports
                </View>
                <View as="div" margin="small 0">
                  <Button
                    color="primary"
                    margin="0 0 0 small"
                    onClick={handleSearchAgain}
                  >
                    Search Again
                  </Button>
                </View>
              </>
            ) : (
              <>
                {/* Search button outside of the toggle group (appears below it in layout) */}
                <View as="div" margin="small 0">
                  <Button
                    color="primary"
                    margin="0 0 0 small"
                    disabled={invalidRange}
                    onClick={handleFilter}
                  >
                    Search
                  </Button>
                </View>
              </>
            )}
          </>
        )}
      </form>

      {/* Show loader, or results if available */}
      {loading ? (
        <Loading />
      ) : (
        sisImports.length > 0 &&
        !hideResults && (
          <List>
            {sisImports.map((sisImport) => (
              <SisImportListItem key={sisImport.id} sisImport={sisImport} />
            ))}
          </List>
        )
      )}

      {/* Pagination controls (only show when we have results) */}
      {!loading && sisImports.length > 0 && !hideResults && (
        <AddPagination
          prevUrl={prevPageUrl}
          currUrl={currentPageUrl}
          nextUrl={nextPageUrl}
          setCurrUrl={setCurrentPageUrl}
        />
      )}
    </View>
  );
}

export default DateFilterPage;
