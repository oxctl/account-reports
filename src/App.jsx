/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { Tabs } from '@instructure/ui-tabs'
import { LtiApplyTheme, LtiTokenRetriever, LaunchOAuth, LtiHeightLimit } from '@oxctl/ui-lti'
import { jwtDecode } from 'jwt-decode'

import HomePage from './HomePage'
import ProvisioningReportsPage from './ProvisioningReportsPage'
import SisImportsPage from './SisImportsPage'



function App() {

  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const [token, setToken] = useState(null)
  const [jwt, setJwt] = useState(null)
  const [needsToken, setNeedsToken] = useState(false)
  
  const [highContrast,setHighContrast] = useState(false)
  const [comInstructureBrandConfigJsonUrl,setComInstructureBrandConfigJsonUrl] = useState(null)
  const [canvasUserPrefersHighContrast, setCanvasUserPrefersHighContrast] = useState(false)
  const [accountId,setAccountId] = useState(1)

  const [server,setServer] = useState(null)
  
  function  capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  const updateToken = (receivedToken, server) => {
	
    setToken(receivedToken)   
       
    setServer(server)
    
    const decodedJwt = jwtDecode(receivedToken)
    setJwt(decodedJwt)
    
    const jwtClaim = decodedJwt['https://purl.imsglobal.org/spec/lti/claim/custom']  
    setComInstructureBrandConfigJsonUrl(jwtClaim.com_instructure_brand_config_json_url)
    setCanvasUserPrefersHighContrast(jwtClaim.canvas_user_prefers_high_contrast === 'true')
	setAccountId(jwtClaim.canvas_account_id)

  }

  const handleTabChange = (event, { index }) => {
    setSelectedIndex(index)
  }

  return (

    <LtiTokenRetriever handleJwt={updateToken}>
    
    		<LtiApplyTheme url={comInstructureBrandConfigJsonUrl} highContrast={canvasUserPrefersHighContrast}>
    		
              <LtiHeightLimit>

			      <LaunchOAuth
			        promptLogin = {needsToken}
			        accessToken = {token}
			        server = {{ proxyServer: server }}
			        promptUserLogin = {() => setNeedsToken(false)}
			      >
			
			        <Tabs
			          margin = "large auto"
			          padding = "medium"
			          onRequestTabChange = {handleTabChange}
			        >
			        
					    <Tabs.Panel
					      id="home"
					      renderTitle="Home"
					      textAlign="start"
					      padding="large"
					      isSelected={selectedIndex === 0} 
					    >
					      <HomePage 
					      	accountId = {accountId}
					      />              
					    </Tabs.Panel>
					    
					  
						<Tabs.Panel
						      id = "reports"
						      renderTitle = "Reports"
						      textAlign = "start"
						      padding = "large"
						      isSelected = {selectedIndex === 1} 
						    >
						       <ProvisioningReportsPage 
						         token = {token} 
						         server =  {server}
						         accountId = {accountId}
						         handle403={() => setNeedsToken(true) }
						       />
						    </Tabs.Panel> 
						 
					    
					   
					     {accountId == 1 && <Tabs.Panel
					      id="sisImports"
					      renderTitle="SIS Imports"
					      textAlign="start"
					      padding="large"
					      isSelected={selectedIndex === 2}
					    >
					      <SisImportsPage 
					         token = {token}
					         server =  {server} 
					         accountId = {accountId}
					         handle403={() => setNeedsToken(true)}
					      />    
					     </Tabs.Panel>    
					     
						}
					        
			        </Tabs>
			      </LaunchOAuth>
             </LtiHeightLimit>
          </LtiApplyTheme>     
      
    </LtiTokenRetriever>
  )
}

export default App
