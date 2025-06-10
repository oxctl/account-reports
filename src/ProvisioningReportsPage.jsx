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

import { parseLinkHeader } from '@web3-storage/parse-link-header'
import { Pagination } from '@instructure/ui-pagination'
import { capitalizeFirstLetter } from "./utils/utils"

import { AddPagination } from './AddPagination'

function ProvisioningReportsPage({ token, server, accountId, handle403 }) {
  
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [prevPageUrl, setPrevPageUrl] = useState(null)
  const [currentPageUrl, setCurrentPageUrl] = useState(server+'/api/v1/accounts/'+accountId+'/reports/provisioning_csv?page=1&per_page=10')

  useEffect(() => {
    if (!token) return
    fetch(currentPageUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
			if (response.status === 403) {
              handle403()
              throw new Error()
            } else if (response.status === 401) {
              const authHeader = response.headers.get('WWW-Authenticate')
              if (authHeader && !authHeader.includes('proxy')) {
                handle403()
                throw new Error()
              } else {
	
// user nenver sees this error, just get stuck in an auth loop - 
	
                throw new Error('You don\'t have permission to access your profile. Or your session has expired, please try relaunching the tool')
              }
            } else if (response.status === 400) {
              const err = "Response of 400 Bad Request: we have given up and are looking longingly at the pub."
              console.error(err)
              throw new Error(err)
            } else {
              throw new Error('Bad response: ' + response.status)
            }
        }
        
        
        // grab next / prev links
        const links = parseLinkHeader(response.headers.get('Link'))
        setNextPageUrl(links?.next?.url || null)
        setPrevPageUrl(links?.prev?.url || null)
               
        return response.json()
      })
      .then(setReports)
      .catch((err) => {
        console.error('Fetch error (provisioning):', err)
        setError(err.message)
      })
  }, [token, currentPageUrl])
  
  
  return (

      <View as="div" padding="large">
        <Heading level="h1" as="h2">List of Provisioning Reports</Heading>
        {error && <Text color="danger">{error}</Text>}
 		{reports.length == 0 && <Text>No available reports.</Text>}

        <List>
          {reports.slice(0, reports.length).map((report) => {
            const {
              id,
              progress,
              status,
              ended_at,
              parameters: { extra_text } = {},
              attachment: { url = '' } = {}
            } = report

            let mainTitle = extra_text?.match(/Reports.*$/)?.[0] || 'Pending'
            mainTitle = capitalizeFirstLetter(mainTitle.replace('Reports: ', ''))

            let extraInfo = extra_text?.match(/^(.*?)(?=Reports)/)?.[1] || ''
            extraInfo = '(' + extraInfo.replace('Term: ', '').replace(/; $/, '') + ')'

            return (
              <List.Item key={id} margin="small 0">
                <Link href={url} rel="noopener noreferrer">
                  <Text as="span">{mainTitle} {extraInfo}</Text>
                </Link>
                <Text as="span"> ({ended_at ? new Date(ended_at).toLocaleString() : 'N/A'})  =&gt; {progress}%</Text>
              </List.Item>
            )
          })}
        </List>
        
        <AddPagination prevUrl={prevPageUrl} currUrl={currentPageUrl} nextUrl={nextPageUrl} setCurrUrl={setCurrentPageUrl}/>
               
      </View>
   
  )
 
}

export default ProvisioningReportsPage
