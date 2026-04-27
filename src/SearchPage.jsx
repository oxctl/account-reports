import React, { useEffect, useState, useRef } from "react";

import { View } from "@instructure/ui";
import { List } from "@instructure/ui";
import { Heading } from "@instructure/ui";
import { TextInput } from "@instructure/ui";
import { ScreenReaderContent } from "@instructure/ui";
import { IconSearchLine, IconXSolid } from "@instructure/ui";
import { Flex } from "@instructure/ui";
import { IconButton, Button } from "@instructure/ui";

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
function SearchPage({ token, server, accountId, handle40x }) {
  // The SIS import object
  const [sisImport, setSisImport] = useState(null);
  // The API URL for the current search
  const [sisImportUrl, setSisImportUrl] = useState();
  // Error message to display (if any)
  const [sisError, setSisError] = useState(null);
  // The current input value (search text)
  const [value, setValue] = useState("");
  // Ref for focusing/clearing the input
  const inputRef = useRef(null);
  // Hide results when errors occur or input is cleared
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

  // Timer used for throttling the search
  let timeoutId = null;

  /**
   * Handle form submission (Enter or button click).
   */
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setSisError(""); // Clear old errors
    clearTimeout(timeoutId);

    if (!value.length) return;

    // Throttle: delay API call by 1 second
    timeoutId = setTimeout(() => {
      setSisImportUrl(
        `${server}/api/v1/accounts/${accountId}/sis_imports/${value}`,
      );
    }, 1000);
  };

  /**
   * Update input value.
   */
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  /**
   * Clear the input, error, and results.
   */
  const handleClear = () => {
    setValue("");
    setLoading(false);
    setSisError(null);
    setHideResults(true);
    inputRef.current?.focus();
  };

  /**
   * Renders a clear button inside the search box.
   */
  const renderClearButton = () =>
    value ? (
      <IconButton
        onClick={handleClear}
        screenReaderLabel="Clear search"
        withBackground={false}
        withBorder={false}
      >
        <IconXSolid />
      </IconButton>
    ) : null;

  return (
    <View as="div" padding="large">
      <Heading variant="titleSection" level="h2">
        Search for SIS Import
      </Heading>

      <form name="getSisId" onSubmit={handleSearch} autoComplete="off">
        <Flex>
          <Flex.Item shouldGrow>
            <TextInput
              renderLabel={
                <ScreenReaderContent>Search SIS Imports</ScreenReaderContent>
              }
              placeholder="Enter a SIS Import ID ..."
              value={value}
              onChange={handleChange}
              inputRef={(el) => {
                inputRef.current = el;
              }}
              renderBeforeInput={<IconSearchLine inline={false} />}
              renderAfterInput={renderClearButton()}
              messages={missingImportMessage()}
              shouldNotWrap
            />
          </Flex.Item>
          <Flex.Item>
            <Button color="primary" margin="0 0 0 small" onClick={handleSearch}>
              Search
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

export default SearchPage;
