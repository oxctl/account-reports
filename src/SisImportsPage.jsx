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
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { ToggleDetails } from '@instructure/ui-toggle-details'

import { parseLinkHeader } from '@web3-storage/parse-link-header'
import { Pagination } from '@instructure/ui-pagination'

import { AddPagination } from './AddPagination'

function SisImportsPage({ token, server, handle403 }) {

  const [sisImports, setSisImports] = useState({ sis_imports: [] })
  const [sisError, setSisError] = useState(null)
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [prevPageUrl, setPrevPageUrl] = useState(null)
  const [currentPageUrl, setCurrentPageUrl] = useState(server+'/api/v1/accounts/1/sis_imports?page=1&per_page=10')
 
  
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
      .then(setSisImports)
      .catch((err) => {
        console.error('Fetch error (SIS):', err)
        setSisError(err.message)
      })
  }, [token, currentPageUrl])
  
	function AttachmentsList({ attachments }) {
	    
	  if (!Array.isArray(attachments)) return null
	
	  return (
	    <List>
	      {attachments.map((attachment, index) => (
	        <List.Item key={index}>
	          <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
	            {attachment.filename}
	          </Link>
	        </List.Item>
	      ))}
	    </List>
	  )
	}
	
	function WarningsList({ warnings }) {
	    
	  if (!Array.isArray(warnings)) return null
	
	  return (
	    <List>
	      {warnings.map(([filename, message], index) => (		
	        <List.Item key={index}>
	          <Text>{filename}:</Text> {message}
	        </List.Item>
	      ))}
	    </List>
	  )
	}
	
	function CountsList({ counts }) {
		
	  if (!counts || Object.keys(counts).length === 0) {
    	return <Text>No data available.</Text>
  	  }
	    
  		return (
  		  <List>
   		   {Object.entries(counts).map(([key, value]) => (
   		     <List.Item key={key}>
    		      <Text as="span">{key}:</Text> {value}
  		      </List.Item>
   		   ))}
  		  </List>
 		 )
	}
	
	/*function AddPagination () {
		
		function onClick(url) {
			setCurrentPageUrl(url)			
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
        

		
	}*/
	
	/*function AddPagination ({prevUrl, nextUrl}) {
		
		function onClick(url) {
			setCurrentPageUrl(url)			
		}
			
         
      return (   
		  <Pagination 
		  	as="nav" 
		  	margin="small" 
		  	variant="compact"       
		  	labelNext="Next Page"
		  	labelPrev="Previous Page"
		  	>
		  	
		    {prevUrl && <Pagination.Page direction="prev" label="Previous page" onClick={()=>onClick(prevUrl)}>&lt;</Pagination.Page>}
		  	{nextUrl && <Pagination.Page direction="next" label="Next page" onClick={()=>onClick(nextUrl)}>&gt;</Pagination.Page>}
		  </Pagination>
        )
        

		
	}*/
	
	

  return (
	
      <View as="div" padding="large">
        <Heading level="h1" as="h2">List of SIS Imports</Heading>
        {sisError && <Text color="danger">{sisError}</Text>}

		
        <List>
          {sisImports.sis_imports.slice(0, sisImports.sis_imports.length).map((sis) => {
            const {
              id,
              progress,
              ended_at,
              user: { name } = {},
              errors_attachment: { url } = {},
              data: {counts},
              csv_attachments,
              processing_warnings 
            } = sis  
                              

            return (
              <List.Item key={id} margin="small 0">
                <Text as="span">SIS Import ID: {id} {name} ({ended_at ? new Date(ended_at).toLocaleString() : 'N/A'}) =&gt; {progress}%</Text>
                <List>
                  <List.Item>
                    <ToggleDetails summary="Summary of changes"><CountsList counts={counts}/></ToggleDetails>
                  </List.Item>
                  <List.Item>
                    <Text>Attachments:</Text>
                    <AttachmentsList attachments={csv_attachments}/>
                  </List.Item>

                  { url && 
                  <List.Item>
                    <Text>Errors:&nbsp;</Text>
                    <Link href={url} rel="noopener noreferrer">
                      <Text as="span">{url ? url : 'No errors'}</Text>
                    </Link>
                  </List.Item>
                  }

                  { processing_warnings && 
                  <List.Item>
                  <Text>Warning messages: </Text>
                  <WarningsList warnings={processing_warnings} />
				  </List.Item>}
				  
                </List>
              </List.Item>
            )
          })}
        </List>
        
        
        <AddPagination prevUrl={prevPageUrl} nextUrl={nextPageUrl} currUrl={setCurrentPageUrl}/>
      </View>
    
  )
}

export default SisImportsPage
