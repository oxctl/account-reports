import React, { useEffect, useState } from "react";
import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { Link } from "@instructure/ui-link";
import { Text } from "@instructure/ui-text";

import { parseLinkHeader } from "@web3-storage/parse-link-header";
import { capitalizeFirstLetter } from "./utils/utils";
import { handleResponseFailure } from "./utils/handleResponseFailure";

import { AddPagination } from "./AddPagination";
import { Loading } from "./Loading";

function ProvisioningReportsPage({ token, server, accountId, handle403 }) {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPageUrl, setCurrentPageUrl] = useState(
    server +
      "/api/v1/accounts/" +
      accountId +
      "/reports/provisioning_csv?page=1&per_page=10",
  );

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
          handleResponseFailure(response, handle403);
        }

        // grab next / prev links
        const links = parseLinkHeader(response.headers.get("Link"));
        setNextPageUrl(links?.next?.url || null);
        setPrevPageUrl(links?.prev?.url || null);

        return response.json();
      })
      .then(setReports)
      .catch((err) => {
        console.error("Fetch error (provisioning):", err);
        setError(err.message);
      });
  }, [token, currentPageUrl]);

  return (
    <View as="div" padding="large">
      <Heading level="h1" as="h2">
        List of Provisioning Reports
      </Heading>
      {error && <Text color="danger">{error}</Text>}

      {loading ? (
        <Loading />
      ) : (
        reports.length == 0 && <Text>No available reports.</Text>
      )}

      <List>
        {reports.map((report) => {
          const {
            id,
            ended_at,
            parameters: { extra_text } = {},
            attachment: { url = "" } = {},
          } = report;

          let mainTitle = extra_text?.match(/Reports.*$/)?.[0] || "Pending";
          mainTitle = capitalizeFirstLetter(mainTitle.replace("Reports: ", ""));

          let extraInfo = extra_text?.match(/^(.*?)(?=Reports)/)?.[1] || "";
          extraInfo =
            "(" + extraInfo.replace("Term: ", "").replace(/; $/, "") + ")";

          return (
            <List.Item key={id} margin="small 0">
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
