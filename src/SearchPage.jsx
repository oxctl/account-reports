import React, { useEffect, useState, useRef } from 'react'

import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Text } from '@instructure/ui-text'
import { TextInput } from '@instructure/ui-text-input'
import { Link } from '@instructure/ui-link'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { IconSearchLine, IconXSolid } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'

import { IconButton, Button } from '@instructure/ui-buttons'

function SearchPage({ token, server, accountId, handle403 }) {
	
  const [sisImport, setSisImport] = useState(null) 
  const [sisImportUrl, setSisImportUrl] = useState() 
  const [sisError, setSisError] = useState(null)
  const [value, setValue] = useState('') // Test value
  const inputRef = useRef(null);
  //const [submittedValue, setSubmittedValue] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
            let id
            let progress
            let ended_at
            let user
            let url 

            let counts
            let csv_attachments 
            let processing_warnings  
  
  useEffect(() => {
    if (!token) return
    
    // make sure API call URL is set up
    if (!sisImportUrl) return
    
    console.log("sis import url = "+sisImportUrl)

    fetch(sisImportUrl, {
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
                             
        return response.json()
      })
      .then(setSisImport)
      .catch((err) => {
        console.error('Fetch error (SIS):', err)
        setSisError(err.message)
      })
  }, [token, sisImportUrl])
  
  
  
  let timeoutId = null

  const handleSearch = (e) => {

    clearTimeout(timeoutId);

    if (!value.length) {
      return
    }

    setIsLoading(true)
    //setSubmittedValue(value)
    timeoutId = setTimeout(() => {
		setSisImportUrl(server+'/api/v1/accounts/'+accountId+'/sis_imports/'+value)

    }, 1000)
  }

  const handleChange = (event) => {
	setValue(event.target.value)
  }
  
  const handleClear = () => {
    setValue('');
    console.log("handle clear - should we be removing results??")
    inputRef.current?.focus(); // focus the input again
  }
    
  const renderClearButton = () => {
	return value ? (
      <IconButton
        onClick={handleClear}
        screenReaderLabel="Clear search"
        withBackground={false}
        withBorder={false}
      >
        <IconXSolid />
      </IconButton>
    ) : null;
  }

// TO DO - EXTRACT THSE 3

  
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

return (
	
      <View as="div" padding="large">
        <Heading level="h1" as="h2">Search for SIS Import</Heading>
        
			{sisError && <Text color="danger">{sisError + " "}</Text>}
			{!sisImport && sisImportUrl && <Text  color="danger">No SIS Import with that ID</Text>}
		{<Text color="danger"><br/><br/>TO DO: 
		<ul><li>Fails sometimes with Token fails to load</li>
		<li>the No Import line flashes up</li>
		<li>Details should remain when returning to tab</li>
		<li>abstract auth into utils</li>
		<li>abstract common stuff from both sis import pages</li></ul></Text>}
		
		<form
           name="getSisId"
           onSubmit={handleSearch}
           autoComplete="off">
            <Flex>
            	<Flex.Item shouldGrow>
          			<TextInput
         			   	renderLabel={<ScreenReaderContent>Search SIS Imports</ScreenReaderContent>}
            			placeholder="Enter a Sis Import ID ..."
            			value={value}
            			onChange={handleChange}
        		    	inputRef={ (el) => { inputRef.current = el }}
            			renderBeforeInput={<IconSearchLine inline={false} />}
            			renderAfterInput={renderClearButton()}
            			shouldNotWrap
          			/>
               	</Flex.Item>
            	<Flex.Item>
          			<Button
                 		color="primary"
                 		margin="0 0 0 small"
                 		onClick={handleSearch}>
                 	  Search
                	</Button>
            	</Flex.Item>
          </Flex>
        </form>
        	
		{sisImport && <List>
		
   
            
              <List.Item key={sisImport.id} margin="small 0">
                <Text as="span">SIS Import ID: {sisImport.id} {sisImport.user.name ? sisImport.user.name : 'Unknown user'} ({sisImport.ended_at ? new Date(sisImport.ended_at).toLocaleString() : 'N/A'}) =&gt; {sisImport.progress}%</Text>
                <List>
                  <List.Item>
                    <ToggleDetails summary="Summary of changes"><CountsList counts={sisImport.data.counts ? sisImport.data.counts : 0}/></ToggleDetails>
                  </List.Item>
                  <List.Item>
                    <Text>Attachments:</Text>
                    <AttachmentsList attachments={sisImport.csv_attachments}/>
                  </List.Item>
                  
                  { sisImport.errors_attachment && sisImport.errors_attachment.url &&
                  <List.Item>
                    <Text>Errors:&nbsp;</Text>
                    <Link href={sisImport.errors_attachment.url} rel="noopener noreferrer">
                      <Text as="span">{sisImport.errors_attachment.url ? sisImport.errors_attachment.url : 'No errors'}</Text>
                    </Link>
                  </List.Item>
                  }

                  { sisImport.processing_warnings && 
                  <List.Item>
                  <Text>Warning messages: </Text>
                  <WarningsList warnings={sisImport.processing_warnings} />
				  </List.Item>}
				  
                </List>
              </List.Item>
            
        </List>}
     
		
		</View>
	)
}

export default SearchPage