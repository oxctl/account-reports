import React, { useEffect, useState } from "react";
import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { Link } from "@instructure/ui-link";
import { Alert } from "@instructure/ui-alerts";
import { Text } from "@instructure/ui-text";

import { parseLinkHeader } from "@web3-storage/parse-link-header";
import { capitalizeFirstLetter } from "./utils/utils";
import { handleResponseFailure } from "./utils/handleResponseFailure";

import { AddPagination } from "./AddPagination";
import { Loading } from "./Loading";

/**
 * Renders the Provisioning Reports page for a Canvas account.
 *
 * @function ProvisioningReportsPage
 * @param {string} token - Canvas API token used for authenticating requests.
 * @param {string} server - Base server URL for the Canvas instance.
 * @param {string|number} accountId - The Canvas account ID to run the reports against.
 * @param {Function} handle40x - Callback to handle 40x errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered Provisioning Reports page.
 */
function ProvisioningReportsPage({ token, server, accountId, handle40x }) {
  // State for reports, errors, pagination, and loading state
  const [reports, setReports] = useState([]);
  const [alert, setAlert] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track the current API endpoint (starts with page 1, 10 per page)
  const [currentPageUrl, setCurrentPageUrl] = useState(
    `${server}/api/v1/accounts/${accountId}/reports/provisioning_csv?page=1&per_page=10`,
  );

  // Fetch reports when token or currentPageUrl changes
  useEffect(() => {
    if (!token) return;

    fetch(currentPageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setLoading(false);

        if (!response.ok) {
          // Handles 40x / authentication issues
          handleResponseFailure(response, handle40x);
        }

        // Extract pagination links (next/prev) from HTTP headers
        const links = parseLinkHeader(response.headers.get("Link"));
        setNextPageUrl(links?.next?.url || null);
        setPrevPageUrl(links?.prev?.url || null);

        return response.json();
      })
      .then((data) => setReports(data || [])) // Save the JSON reports into state
      .catch((err) => {
        console.error("Fetch error (provisioning):", err);
        setAlert({
          variant: "warning",
          message: `Unable to fetch the list of reports: ` + err.message,
        });
      });
  }, [token, currentPageUrl]);

  return (
    <View as="div" padding="large">
      <Heading variant="titleSection" level="h2">
        List of Provisioning Reports
      </Heading>

      {/* Show error message if API call failed */}
      {alert && (
        <Alert variant={alert.variant} renderCloseButtonLabel="Close">
          {alert.message}
        </Alert>
      )}

      {/* Show spinner while loading, or message if empty */}
      {loading ? (
        <Loading />
      ) : (
        reports.length === 0 && <Text>No available reports.</Text>
      )}

      {/* Render each report item */}
      <List>
        {reports.map((report) => {
          const {
            id,
            ended_at,
            parameters: { extra_text } = {},
            attachment: { url = "" } = {},
          } = report;

          let mainTitle = ""
          if (extra_text) {
          // Extract main title (e.g., "Users", "Courses")
             mainTitle = capitalizeFirstLetter(extra_text?.match(/Reports.*$/)?.[0]?.replace("Reports: ", "") ?? "");
          }
          else {
	         mainTitle = "Report with ID '"+id+"' not yet completed.";
          }

          // Extract optional extra info (like term)
          let extraInfo = extra_text?.match(/^(.*?)(?=Reports)/)?.[1] || "";
          extraInfo =
            "(" + extraInfo.replace("Term: ", "").replace(/; $/, "") + ")";

          return (
            <List.Item key={id} margin="small 0">
              {/* Download link to CSV report */}
              <Link href={url} rel="noopener noreferrer">
                <Text as="span">
                  {mainTitle} {extraInfo}
                </Text>
              </Link>
              <Text as="span">
                {" "}
                ({ended_at ? new Date(ended_at).toLocaleString() : "N/A"})
              </Text>
            </List.Item>
          );
        })}
      </List>

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

export default ProvisioningReportsPage;
