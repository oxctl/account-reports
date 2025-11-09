import React, { useState, useCallback, useMemo } from "react";
import { Grid } from "@instructure/ui-grid";
import { Text } from "@instructure/ui-text";
import { Heading } from "@instructure/ui-heading";
import DuplicateLoginsJob from "./jobs/DuplicateLoginsJob";
import RoleMatchJob from "./jobs/RoleMatchJob";
import { ENROL_REPORTS } from "./utils/constants";
import { View } from "@instructure/ui-view";
import { Alert } from "@instructure/ui-alerts";
import AccountAdminUsersJob from "./jobs/AccountAdminUsersJob";
import ExternalAdminUsersJob from "./jobs/ExternalAdminUsersJob";
import SubaccountAdminsJob from "./jobs/SubaccountAdminsJob";
import ReportAction from "./ReportAction";

/**
 * Renders the Account Reports page for a Canvas account.
 *
 * @function AccountReportsPage
 * @param {string} token - API token used for authenticating requests.
 * @param {string} server - Base server URL for the Canvas Proxy.
 * @param {string} canvas - Base server URL for Canvas.
 * @param {string|number} accountId - The Canvas account ID to run the reports against.
 * @param {string|number} rootAccountId - The Canvas root account ID
 * @param {Function} handle40x - Callback to handle 40x errors from the API - gets user to authenticate.
 * @returns {JSX.Element} The rendered Provisioning Reports page.
 */
function AccountReportsPage({
  token,
  server,
  canvas,
  accountId,
  rootAccountId,
  handle40x,
}) {
  // ENROL_REPORTS is an array built from env (see src/utils/constants.js).
  // We'll render one report entry per configured enrolment report.
  // Track all alert messages shown to the user (e.g., success/error notices)
  const [alerts, setAlerts] = useState([]);

  // Determine if the current account is the root account
  const showRootAccountReports = accountId == rootAccountId;

  // A ref that increments to give each alert a unique stable ID
  const alertIdRef = React.useRef(0);

  // --- Reports configuration ---
  // Define all available reports (name, description, job runner).
  // Some reports should only be shown at the root account level.
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
      // Expand configured enrolment reports into report entries
      ...ENROL_REPORTS.map((r) => ({
        name: r.name,
        description: "A contextual list of people with this role",
        run: (server, token, options) =>
          new RoleMatchJob(server, token, { ...options, roleId: r.id }),
        showOnSubaccount: true,
      })),
    ],
    [ENROL_REPORTS],
  );

  // --- Alert handling ---
  // Add a new alert message
  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [...prev, { ...alert, id: alertIdRef.current++ }]);
  }, []);

  // Show a single non-dismissible run-warning when any report starts
  const [showRunWarning, setShowRunWarning] = useState(false);

  // Remove a specific alert by ID
  const removeAlert = useCallback((removeId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== removeId));
  }, []);

  // Render all alert messages
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

  // Render the list of reports available for this account
  const renderReports = () => {
    // Show all reports if root account, otherwise only subaccount-enabled reports
    const visibleReports = showRootAccountReports
      ? reports
      : reports.filter((r) => r.showOnSubaccount);

    // Options passed to each job runner
    const options = {};
    if (accountId) options.accountId = accountId;
    if (canvas) options.baseUrl = canvas;
    if (rootAccountId) options.rootAccountId = rootAccountId;

    // Render each report in a grid row with heading, description, and action button
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
            onRunStart={() => setShowRunWarning(true)}
          />
        </Grid.Col>
      </Grid.Row>
    ));
  };

  return (
    <>
      {renderAlerts()}
      <View as="div" padding="large">
        {showRunWarning && (
          <Alert variant="warning">
            Download links will disappear if you change tabs - ensure you
            download any reports you need before changing tabs.
          </Alert>
        )}
        <Heading variant="titleSection" level="h2">
          User Reports
        </Heading>
        <Grid vAlign="middle" width="100%">
          {renderReports()}
        </Grid>
      </View>
    </>
  );
}

export default AccountReportsPage;
