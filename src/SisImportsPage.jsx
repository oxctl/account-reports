import React, { useEffect, useState } from "react";

import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { Text } from "@instructure/ui-text";

import { parseLinkHeader } from "@web3-storage/parse-link-header";

import { AddPagination } from "./AddPagination";
import { SisImportListItem } from "./SisImportListItem";

import { handleResponseFailure } from "./utils/handleResponseFailure";

function SisImportsPage({ token, server, accountId, handle403 }) {
  const [sisImports, setSisImports] = useState({ sis_imports: [] });
  const [sisError, setSisError] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(
    server +
      "/api/v1/accounts/" +
      accountId +
      "/sis_imports?page=1&per_page=10",
  );

  useEffect(() => {
    if (!token) return;

    fetch(currentPageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          handleResponseFailure(response, handle403);
        }

        // grab next / prev links
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
      {sisError && <Text color="danger">{sisError}</Text>}
      {sisImports.sis_imports.length == 0 && <Text>No available reports.</Text>}

      <List>
        {sisImports.sis_imports.map((sisImport) => (
          <SisImportListItem key={sisImport.id} sisImport={sisImport} />
        ))}
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

export default SisImportsPage;
