import React from "react";
import { View } from "@instructure/ui-view";
import { Heading } from "@instructure/ui-heading";
import { Text } from "@instructure/ui-text";

function HomePage({ accountId }) {
  return (
    <View as="div" padding="large">
      <Heading level="h1" as="h2">
        Provisioning Reports
      </Heading>

      {accountId == 1 && (
        <Text>
          There are a number of different report listings, click on the tab to
          view.
        </Text>
      )}
      {accountId != 1 && (
        <Text>
          Click on the 'Reports' tab to see a list of Provisioning reports which
          have been generated in this sub-account.
        </Text>
      )}
    </View>
  );
}

export default HomePage;
