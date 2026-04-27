import React, { useEffect, useState } from "react";

import { Alert, Heading, List, View } from "@instructure/ui";

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
 * @param {Function} handle40x - Callback to handle 40x (Forbidden) errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered Provisioning Reports page.
 */
function SisImportsPage({ token, server, accountId, handle40x }) {
  // State: list of SIS imports (default empty array inside object)
  const [sisImports, setSisImports] = useState([]);
  // State: error message if request fails
  const [alert, setAlert] = useState(null);
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
          handleResponseFailure(response, handle40x);
        }

        // Parse pagination links from response headers
        const links = parseLinkHeader(response.headers.get("Link"));
        setNextPageUrl(links?.next?.url || null);
        setPrevPageUrl(links?.prev?.url || null);

        return response.json();
      })
      .then((data) => setSisImports(data.sis_imports || []))
      .catch((err) => {
        console.error("Fetch error (SIS):", err);
        setAlert({
          variant: "warning",
          message: `Unable to fetch the list of imports: ` + err.message,
        });
      });
  }, [token, currentPageUrl]);

  return (
    <View as="div" padding="large">
      <Heading variant="titleSection" level="h2">
        List of SIS Imports
      </Heading>

      {/* Show error message if API call failed */}
      {alert && (
        <Alert variant={alert.variant} renderCloseButtonLabel="Close">
          {alert.message}
        </Alert>
      )}

      {/* Show spinner while loading, otherwise the list */}
      {loading ? (
        <Loading />
      ) : (
        <List>
          {sisImports.map((sisImport) => (
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
