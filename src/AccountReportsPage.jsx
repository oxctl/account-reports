import React, { useEffect, useState } from "react";
import { View } from "@instructure/ui-view";
import { Text } from "@instructure/ui-text";
import { Heading } from "@instructure/ui-heading";

function AccountReportsPage({ token, server, accountId, handle403 }) {
  const [error, setError] = useState(null);

  return (
    <View as="div" padding="large">
      <Heading level="h1" as="h2">
        Account Reports
      </Heading>
      {error && <Text color="danger">{error}</Text>}

      <Text>
        <p>To be completed</p>
      </Text>
    </View>
  );
}

export default AccountReportsPage;
