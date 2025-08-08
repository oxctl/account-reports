import React, { useState } from "react";

import { Tabs } from "@instructure/ui-tabs";
import {
  LtiApplyTheme,
  LtiTokenRetriever,
  LaunchOAuth,
  LtiHeightLimit,
} from "@oxctl/ui-lti";

import { jwtDecode } from "jwt-decode";

import HomePage from "./HomePage";
import ProvisioningReportsPage from "./ProvisioningReportsPage";
import SisImportsPage from "./SisImportsPage";
import SearchPage from "./SearchPage";

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
            <Tabs
              margin="large auto"
              padding="medium"
              onRequestTabChange={handleTabChange}
            >
              <Tabs.Panel
                id="home"
                renderTitle="Home"
                textAlign="start"
                padding="large"
                isSelected={selectedIndex === 0}
              >
                <HomePage accountId={accountId} />
              </Tabs.Panel>

              <Tabs.Panel
                id="reports"
                renderTitle="Reports"
                textAlign="start"
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

              {accountId == 1 && (
                <Tabs.Panel
                  id="sisImports"
                  renderTitle="SIS Imports"
                  textAlign="start"
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

              {accountId == 1 && (
                <Tabs.Panel
                  id="sisImportSearch"
                  renderTitle="Search for SIS Import"
                  textAlign="start"
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
          </LaunchOAuth>
        </LtiHeightLimit>
      </LtiApplyTheme>
    </LtiTokenRetriever>
  );
}

export default App;
