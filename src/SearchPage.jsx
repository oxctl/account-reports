import React, { useEffect, useState, useRef } from "react";

import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import { Heading } from "@instructure/ui-heading";
import { TextInput } from "@instructure/ui-text-input";
import { ScreenReaderContent } from "@instructure/ui-a11y-content";
import { IconSearchLine, IconXSolid } from "@instructure/ui-icons";
import { Flex } from "@instructure/ui-flex";
import { IconButton, Button } from "@instructure/ui-buttons";

import { SisImportListItem } from "./SisImportListItem";
import { Loading } from "./Loading";
import { handleResponseFailure } from "./utils/handleResponseFailure";

function SearchPage({ token, server, accountId, handle403 }) {
  const [sisImport, setSisImport] = useState(null);
  const [sisImportUrl, setSisImportUrl] = useState();
  const [sisError, setSisError] = useState(null);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const [hideResults, setHideResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const missingImportMessage = () => {
    if (sisError) {
      return [{ type: "newError", text: sisError }];
    }
  };

  useEffect(() => {
    if (!token || !sisImportUrl) return;

    fetch(sisImportUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        //  hide the results
        setHideResults(true);
        setLoading(false);

        if (!response.ok) {
          handleResponseFailure(response, handle403);
        } else {
          // dont hide the results
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

  let timeoutId = null;

  const handleSearch = (e) => {
    // allows enter / return to submit
    e.preventDefault();

    setLoading(true);

    //remove old message
    setSisError("");

    clearTimeout(timeoutId);

    if (!value.length) {
      return;
    }

    timeoutId = setTimeout(() => {
      setSisImportUrl(
        server + "/api/v1/accounts/" + accountId + "/sis_imports/" + value,
      );
    }, 1000);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue("");

    setLoading(false);

    // remove any previous errors
    setSisError(null);

    // hide results
    setHideResults(true);

    // focus the input again
    inputRef.current?.focus();
  };

  const renderClearButton = () => {
    return value ? (
      <IconButton
        onClick={handleClear}
        screenReaderLabel="Clear search"
        withBackground={false}
        withBorder={false}
      >
        <IconXSolid />
      </IconButton>
    ) : null;
  };

  return (
    <View as="div" padding="large">
      <Heading level="h1" as="h2">
        Search for SIS Import
      </Heading>

      <form name="getSisId" onSubmit={handleSearch} autoComplete="off">
        <Flex>
          <Flex.Item shouldGrow>
            <TextInput
              renderLabel={
                <ScreenReaderContent>Search SIS Imports</ScreenReaderContent>
              }
              placeholder="Enter a Sis Import ID ..."
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
