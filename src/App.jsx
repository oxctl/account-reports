import React, { useState } from "react";

import { Tabs } from "@instructure/ui-tabs";
import { Text } from "@instructure/ui-text";
import {
  LtiApplyTheme,
  LtiTokenRetriever,
  LaunchOAuth,
  LtiHeightLimit,
} from "@oxctl/ui-lti";

import { jwtDecode } from "jwt-decode";
import { View } from "@instructure/ui-view";
import { Heading } from "@instructure/ui-heading";
import ProvisioningReportsPage from "./ProvisioningReportsPage";
import SisImportsPage from "./SisImportsPage";
import SearchPage from "./SearchPage";
import AccountReportsPage from "./AccountReportsPage";

/**
 * The tool works differently for people with the sis_manage permission at the
 * root account with lots more tabs available. Everyone will see the Account Tools and
 * Provisioning reports page
 */

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [token, setToken] = useState(null);
  const [needsToken, setNeedsToken] = useState(false);
  const [hasSisPermish, setHasSisPermish] = useState(false);

  const [
    comInstructureBrandConfigJsonUrl,
    setComInstructureBrandConfigJsonUrl,
  ] = useState(null);
  const [canvasUserPrefersHighContrast, setCanvasUserPrefersHighContrast] =
    useState(false);
  const [accountId, setAccountId] = useState(1);

  const [server, setServer] = useState(null);

  const updateToken = (receivedToken, server) => {
    setToken(receivedToken);

    setServer(server);

    const decodedJwt = jwtDecode(receivedToken);

    const jwtClaim =
      decodedJwt["https://purl.imsglobal.org/spec/lti/claim/custom"];
    setComInstructureBrandConfigJsonUrl(
      jwtClaim.com_instructure_brand_config_json_url,
    );
    setCanvasUserPrefersHighContrast(
      jwtClaim.canvas_user_prefers_high_contrast === "true",
    );

    // which subaccount are we in?
    setAccountId(jwtClaim.canvas_account_id);

    // check the user has sis_manage permission
    setHasSisPermish(jwtClaim.canvas_membership_permissions == "manage_sis");
  };

  const handleTabChange = (event, { index }) => {
    setSelectedIndex(index);
  };

  /*
   * We assume the user is authenticated and then handle the exception
   * if they are not (using promptUserLog / setNeedsToken).
   */
  return (
    <LtiTokenRetriever handleJwt={updateToken}>
      <LtiApplyTheme
        url={comInstructureBrandConfigJsonUrl}
        highContrast={canvasUserPrefersHighContrast}
      >
        <LtiHeightLimit>
          <LaunchOAuth
            promptLogin={needsToken}
            accessToken={token}
            server={{ proxyServer: server }}
            promptUserLogin={() => setNeedsToken(false)}
          >
            <View as="div" padding="large">
              <Heading level="h1" as="h2">
                Account Reports
              </Heading>

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
                  renderTitle="Account Reports"
                  padding="large"
                  isSelected={selectedIndex === 0}
                >
                  <AccountReportsPage
                    token={token}
                    server={server}
                    accountId={accountId}
                    baseUrl={server + "/api/v1"}
                    rootAccountId={1}
                    handle403={() => setNeedsToken(true)}
                  />
                </Tabs.Panel>

                <Tabs.Panel
                  id="reports"
                  renderTitle="Reports"
                  padding="large"
                  isSelected={selectedIndex === 1}
                >
                  <ProvisioningReportsPage
                    token={token}
                    server={server}
                    accountId={accountId}
                    handle403={() => setNeedsToken(true)}
                  />
                </Tabs.Panel>

                {accountId == 1 && hasSisPermish && (
                  <Tabs.Panel
                    id="sisImports"
                    renderTitle="SIS Imports"
                    padding="large"
                    isSelected={selectedIndex === 2}
                  >
                    <SisImportsPage
                      token={token}
                      server={server}
                      accountId={accountId}
                      handle403={() => setNeedsToken(true)}
                    />
                  </Tabs.Panel>
                )}

                {accountId == 1 && hasSisPermish && (
                  <Tabs.Panel
                    id="sisImportSearch"
                    renderTitle="Search for SIS Import"
                    padding="large"
                    isSelected={selectedIndex === 3}
                  >
                    <SearchPage
                      token={token}
                      server={server}
                      accountId={accountId}
                      handle403={() => setNeedsToken(true)}
                    />
                  </Tabs.Panel>
                )}
              </Tabs>
            </View>
          </LaunchOAuth>
        </LtiHeightLimit>
      </LtiApplyTheme>
    </LtiTokenRetriever>
  );
}

export default App;
