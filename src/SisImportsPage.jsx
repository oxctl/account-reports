import React, { useEffect, useState } from "react";

import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { Text } from "@instructure/ui-text";

import { parseLinkHeader } from "@web3-storage/parse-link-header";

import { AddPagination } from "./AddPagination";
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
 * @param {Function} handle403 - Callback to handle 403 (Forbidden) errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered Provisioning Reports page.
 */
function SisImportsPage({ token, server, accountId, handle403 }) {
  // State: list of SIS imports (default empty array inside object)
  const [sisImports, setSisImports] = useState({ sis_imports: [] });
  // State: error message if request fails
  const [sisError, setSisError] = useState(null);
  // State: pagination links
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  // State: loading flag for spinner
  const [loading, setLoading] = useState(true);
  // State: currently selected page URL
  const [currentPageUrl, setCurrentPageUrl] = useState(
    `${server}/api/v1/accounts/${accountId}/sis_imports?page=1&per_page=10`,
  );

  /**
   * Effect: Fetch SIS imports whenever the token or current page changes.
   */
  useEffect(() => {
    if (!token) return;

    fetch(currentPageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setLoading(false);

        // Handle failed responses
        if (!response.ok) {
          handleResponseFailure(response, handle403);
        }

        // Parse pagination links from response headers
        const links = parseLinkHeader(response.headers.get("Link"));
        setNextPageUrl(links?.next?.url || null);
        setPrevPageUrl(links?.prev?.url || null);

        return response.json();
      })
      .then(setSisImports)
      .catch((err) => {
        console.error("Fetch error (SIS):", err);
        setSisError(err.message);
      });
  }, [token, currentPageUrl]);

  return (
    <View as="div" padding="large">
      <Heading level="h1" as="h2">
        List of SIS Imports
      </Heading>

      {/* Show error message if API call failed */}
      {sisError && <Text color="danger">{sisError}</Text>}

      {/* Show spinner while loading, otherwise the list */}
      {loading ? (
        <Loading />
      ) : (
        <List>
          {sisImports.sis_imports.map((sisImport) => (
            <SisImportListItem key={sisImport.id} sisImport={sisImport} />
          ))}
        </List>
      )}

      {/* Pagination controls */}
      <AddPagination
        prevUrl={prevPageUrl}
        currUrl={currentPageUrl}
        nextUrl={nextPageUrl}
        setCurrUrl={setCurrentPageUrl}
      />
    </View>
  );
}

export default SisImportsPage;
