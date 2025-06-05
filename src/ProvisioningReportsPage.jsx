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

function ProvisioningReportsPage({ token, server, handle403 }) {
  
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [prevPageUrl, setPrevPageUrl] = useState(null)
  const [currentPageUrl, setCurrentPageUrl] = useState(server+'/api/v1/accounts/1/reports/provisioning_csv?page=1&per_page=10')


  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1)
  }

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
  
  	function AddPagination () {
		
		function onClick(url) {
			setCurrentPageUrl(url)
			
			// Scroll to top when page changes
			// TO DO - doesnt work
 			const el = document.getElementById("reports")
            el?.scrollTo({ top: 0, behavior: "smooth" })
		}
			
         
      return (   
		  <Pagination 
		  	as="nav" 
		  	margin="small" 
		  	variant="compact"       
		  	labelNext="Next Page"
		  	labelPrev="Previous Page"
		  	>
		    {prevPageUrl && <Pagination.Page direction="prev" label="Previous page" onClick={()=>onClick(prevPageUrl)}>&lt;</Pagination.Page>}
		  	{nextPageUrl && <Pagination.Page direction="next" label="Next page" onClick={()=>onClick(nextPageUrl)}>&gt;</Pagination.Page>}
		  </Pagination>
        )
     }
        

		
	
  
  return (

      <View as="div" padding="large">
        <Heading level="h1" as="h2">List of Provisioning Reports</Heading>
        {error && <Text color="danger">{error}</Text>}


        <List>
          {reports.slice(0, reports.length).map((report) => {
            const {
              id,
              status,
              created_at,
              parameters: { extra_text } = {},
              attachment: { size, url = '' } = {}
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
                <List>
                  <List.Item>Status: {status}</List.Item>
                  <List.Item>Created: {new Date(created_at).toLocaleString()}</List.Item>
                  <List.Item>
                    Size: {size ? (size / 1024).toFixed(2) : 'N/A'} KB
                  </List.Item>
                </List>
              </List.Item>
            )
          })}
        </List>
        
        <AddPagination/>
               
      </View>
   
  )
 
}

export default ProvisioningReportsPage
