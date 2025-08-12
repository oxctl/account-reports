import React, { useEffect, useState } from "react";

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
