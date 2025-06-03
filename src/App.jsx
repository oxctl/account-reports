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
import { LtiApplyTheme, LtiTokenRetriever, LaunchOAuth } from '@oxctl/ui-lti'
import { jwtDecode } from 'jwt-decode'

import HomePage from './HomePage'
import ProvisioningReportsPage from './ProvisioningReportsPage'
import SisImportsPage from './SisImportsPage'



function App() {
  const [reports, setReports] = useState([])
  const [sisImports, setSisImports] = useState([])
  const [error, setError] = useState(null)
  const [sisError, setSisError] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [token, setToken] = useState(null)
  const [jwt, setJwt] = useState(null)
  const [needsToken, setNeedsToken] = useState(true)
  const [highContrast,setHighContrast] = useState(false)
  const [comInstructureBrandConfigJsonUrl,setComInstructureBrandConfigJsonUrl] = useState(null)
  const [server,setServer] = useState(null)
  
  function  capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  const updateToken = (receivedToken, server) => {
    setToken(receivedToken)      
    setServer(server)
    const jwt = jwtDecode(receivedToken)
    setJwt(jwt)
  }

  const handleTabChange = (event, { index }) => {
    setSelectedIndex(index)
  }

  return (

    <LtiTokenRetriever handleJwt={updateToken}>

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
		      <HomePage />              
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
		         handle403={() => setNeedsToken(true) }
		       />
		    </Tabs.Panel> 
		    
		    <Tabs.Panel
		      id="sisImports"
		      renderTitle="SIS Imports"
		      textAlign="start"
		      padding="large"
		      isSelected={selectedIndex === 2}
		    >
		      <SisImportsPage 
		         token = {token}
		         server =  {server} 
		         handle403={() => setNeedsToken(true)}
		      />    
		     </Tabs.Panel>        
        </Tabs>
      </LaunchOAuth>
    </LtiTokenRetriever>
  )
}

export default App
