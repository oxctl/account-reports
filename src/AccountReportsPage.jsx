import React, { useState, useCallback, useMemo } from "react";
import { Grid } from "@instructure/ui-grid";
import { Text } from "@instructure/ui-text";
import { Heading } from "@instructure/ui-heading";
import DuplicateLoginsJob from "./jobs/DuplicateLoginsJob";
import { View } from "@instructure/ui-view";
import { Alert } from "@instructure/ui-alerts";
import AccountAdminUsersJob from "./jobs/AccountAdminUsersJob";
import ExternalAdminUsersJob from "./jobs/ExternalAdminUsersJob";
import SubaccountAdminsJob from "./jobs/SubaccountAdminsJob";
import ReportAction from "./ReportAction";


function AccountReportsPage({ token, server, baseUrl, accountId, rootAccountId, handle403 }) {

  const [alerts, setAlerts] = useState([]);
  const showRootAccountReports = accountId == rootAccountId;
  const alertIdRef = React.useRef(0);
  
  
	// Set up all the reports & say which are displayed in places other than the root account  
    const reports = useMemo(
    () => [
      {
        name: "Account Admin Users",
        description:
          "A list of all the admin users and the sub-accounts they have access to. These users should be reviewed on a regular basis",
        run: (server, token, options) =>
          new AccountAdminUsersJob(server, token, options),
        showOnSubaccount: false,
      },
      {
        name: "External Admin Users",
        description:
          "A list of all the external users that have admin access through sub-accounts. There should not be any external users with an admin account in Canvas.",
        run: (server, token, options) =>
          new ExternalAdminUsersJob(server, token, options),
        showOnSubaccount: false,
      },
      {
        name: "Sub-account Admins",
        description:
          "A list of all the sub-accounts and the LCCs/Unit Admins managing them.",
        run: (server, token, options) =>
          new SubaccountAdminsJob(server, token, options),
        showOnSubaccount: false,
      },
      {
        name: "Multiple Login Users",
        description: "A list of all users who have more than one login.",
        run: (server, token, options) =>
          new DuplicateLoginsJob(server, token, options),
        showOnSubaccount: true,
      },
    ],
    []
  );

  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [
      ...prev,
      { ...alert, id: alertIdRef.current++ },
    ]);
  }, []);

  const removeAlert = useCallback((removeId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== removeId));
  }, []);

  const renderAlerts = () =>
    alerts.map((alert) => (
      <Alert
        key={alert.id}
        variant={alert.variant}
        renderCloseButtonLabel="Close"
        onDismiss={() => removeAlert(alert.id)}
      >
        {alert.message}
      </Alert>
    ));
    
    
  const renderReports = () => {
	
    const visibleReports = showRootAccountReports
      ? reports
      : reports.filter((r) => r.showOnSubaccount);
      
    const options = {};
    
    if (accountId) options.accountId = accountId;
    if (baseUrl) options.baseUrl = baseUrl;
    if (rootAccountId) options.rootAccountId = rootAccountId;

    return visibleReports.map((report, idx) => (
      <Grid.Row key={idx}>
        <Grid.Col width={3}>
          <Heading level="h4" as="h2">
            {report.name}
          </Heading>
        </Grid.Col>
        <Grid.Col width={6}>
          <Text>{report.description}</Text>
        </Grid.Col>
        <Grid.Col width={3}>
          <ReportAction
            name={report.name}
            report={() => report.run(server, token, options)}
            addAlert={addAlert}
          />
        </Grid.Col>
      </Grid.Row>
    ));
  };

  return (
    <>
      {renderAlerts()}
      <View as="div" padding="small">
        <Grid vAlign="middle" width="100%">
          {renderReports()}
        </Grid>
      </View>
    </>
  );
}


export default AccountReportsPage;