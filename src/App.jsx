import React, { useCallback, useState } from "react";

import { Alert, Heading, Tabs, Text, View } from "@instructure/ui";
import { LaunchOAuth, LtiHeightLimit, LtiPageSettings, LtiTokenRetriever, } from "@oxctl/ui-lti";

import { jwtDecode } from "jwt-decode";

import ProvisioningReportsPage from "./ProvisioningReportsPage";
import SearchPage from "./SearchPage";
import DateFilterPage from "./DateFilterPage";
import AccountReportsPage from "./AccountReportsPage";

import { ROOT_ACCOUNT_ID } from "./utils/constants";

/**
 * The tool works differently for people with the sis_manage permission at the
 * root account with lots more tabs available. Everyone will see the Account Tools and
 * Provisioning reports page
 */

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [token, setToken] = useState(null);
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(null);
  const [alert, setAlert] = useState(null);
  const [needsToken, setNeedsToken] = useState(false);
  const [hasSisPermission, setHasSisPermission] = useState(false);

  const [accountId, setAccountId] = useState(1);

  // Keep as a string so LaunchOAuth never receives a null server prop
  const [proxyBaseUrl, setProxyBaseUrl] = useState("");

  // Stable callback: check whether user has a Canvas Access Token (don't follow redirects)
  const checkAccess = useCallback((proxyBaseUrl, jwt) => {
    fetch(proxyBaseUrl + "/tokens/refresh", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      redirect: "manual",
    })
      .then((response) => {
        if (!response.ok) {
          // Handles 40x / authentication issues
          setNeedsToken(true);
        }
      })
      .then()
      .catch((err) => {
        console.error("Fetch error (App):", err);
        setAlert({
          variant: "error",
          message:
            `Unable to initialise the tool. Please contact support and report the problem: ` +
            err.message,
        });
      });
  }, []);

  // Stable callback: avoid recreating handleJwt on every render
  const updateToken = useCallback(
    (receivedToken, receivedProxyBaseUrl) => {
      setToken(receivedToken);
      setProxyBaseUrl(receivedProxyBaseUrl);

      const decodedJwt = jwtDecode(receivedToken);
      const jwtClaim =
        decodedJwt["https://purl.imsglobal.org/spec/lti/claim/custom"];

      // which subaccount are we in?
      setAccountId(jwtClaim.canvas_account_id);

      // Which Canvas are we in?
      setCanvasBaseUrl(jwtClaim.canvas_api_base_url);

      // check the user has sis_manage permission
      setHasSisPermission(
        jwtClaim.canvas_membership_permissions == "manage_sis"
      );

      checkAccess(receivedProxyBaseUrl, receivedToken);
    },
    [checkAccess]
  );

  const handleTabChange = (event, { index }) => {
    setSelectedIndex(index);
  };

  // Check token exists by call a tool support endpoint => get 401 if user hasn't granted access then ask for it

  /*
   * We assume the user is authenticated and then handle the exception
   * if they are not (using promptUserLog / setNeedsToken).
   */
  return (
    <LtiTokenRetriever handleJwt={updateToken}>
      <LtiPageSettings>
        <LtiHeightLimit>
          <LaunchOAuth
            promptLogin={needsToken}
            accessToken={token}
            server={{ proxyServer: proxyBaseUrl }}
            promptUserLogin={() => setNeedsToken(false)}
          >
            <View as="div" padding="large">
              <Heading level="h1">Account Reports</Heading>

              {/* Show alert if fetch failed */}
              {alert && <Alert variant={alert.variant}>{alert.message}</Alert>}

              <Text>
                There are a number of different reports which can be generated
                from within this account. Click on the appropriate tab to view.
              </Text>

              <Tabs
                margin="large auto"
                padding="medium"
                onRequestTabChange={handleTabChange}
              >
                <Tabs.Panel
                  id="accountReportsPage"
                  renderTitle="User Reports"
                  padding="large"
                  isSelected={selectedIndex === 0}
                >
                  <AccountReportsPage
                    token={token}
                    server={proxyBaseUrl}
                    canvas={canvasBaseUrl}
                    accountId={accountId}
                    rootAccountId={ROOT_ACCOUNT_ID}
                    handle40x={() => setNeedsToken(true)}
                  />
                </Tabs.Panel>

                <Tabs.Panel
                  id="reports"
                  renderTitle="Provisioning Reports"
                  padding="large"
                  isSelected={selectedIndex === 1}
                >
                  <ProvisioningReportsPage
                    token={token}
                    server={proxyBaseUrl}
                    accountId={accountId}
                    handle40x={() => setNeedsToken(true)}
                  />
                </Tabs.Panel>

                {accountId == ROOT_ACCOUNT_ID && hasSisPermission && (
                  <Tabs.Panel
                    id="sisImportDateFilter"
                    renderTitle="SIS Imports"
                    padding="large"
                    isSelected={selectedIndex === 2}
                  >
                    <DateFilterPage
                      token={token}
                      server={proxyBaseUrl}
                      accountId={accountId}
                      handle40x={() => setNeedsToken(true)}
                    />
                  </Tabs.Panel>
                )}

                {accountId == ROOT_ACCOUNT_ID && hasSisPermission && (
                  <Tabs.Panel
                    id="sisImportSearch"
                    renderTitle="Search for SIS Import"
                    padding="large"
                    isSelected={selectedIndex === 3}
                  >
                    <SearchPage
                      token={token}
                      server={proxyBaseUrl}
                      accountId={accountId}
                      handle40x={() => setNeedsToken(true)}
                    />
                  </Tabs.Panel>
                )}
              </Tabs>
            </View>
          </LaunchOAuth>
        </LtiHeightLimit>
      </LtiPageSettings>
    </LtiTokenRetriever>
  );
}

export default App;
