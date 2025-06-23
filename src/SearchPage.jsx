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
  const [value, setValue] = useState('') 
  const inputRef = useRef(null);
  const [hideResults, setHideResults] = useState(false)
 
  
  function missingImportMessage () {
	
	if (sisError) return [{type: 'newError', text: sisError}]
	
	if ( !sisImport && sisImportUrl ) {
		console.log (" should show ERROR ")
    	return [{type: 'newError', text: 'SIS Import not found'}]
  
    }
    else {
	  	console.log (" should NOT show error ")
    	return []
    }
  }
  
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
	
	    	//  hide the results
    		setHideResults(true)
    		
          	if (response.status === 403) {
              handle403()
              throw new Error()
            } else if (response.status === 401) {
              const authHeader = response.headers.get('WWW-Authenticate')
              if (authHeader && !authHeader.includes('proxy')) {
                handle403()
                throw new Error()
              } else {
                throw new Error('You don\'t have permission or your session has expired, please try relaunching the tool')
              }
            } else if (response.status === 400) {
              const err = "400 error Bad Request."
              console.error(err)
              throw new Error(err)
            } else if (response.status === 404) {
              const err = "There is no SIS Import matching that ID."
              console.error(err)
              throw new Error(err)
            } else {
              throw new Error('Bad response: ' + response.status)
            }
        }
        else {
 			// dont hide the results
    		setHideResults(false)  
    	}                       
        return response.json()
      })
      .then(setSisImport)
      .catch((err) => {
        console.error('Fetch error (SIS):', err)
        setSisError(err.message)
        setHideResults(true)
      })
  }, [token, sisImportUrl])
  
  
  
  let timeoutId = null

  const handleSearch = (e) => {
	
	e.preventDefault(); // prevents page reload

    clearTimeout(timeoutId);

    if (!value.length) {
      return
    }

    timeoutId = setTimeout(() => {
		setSisImportUrl(server+'/api/v1/accounts/'+accountId+'/sis_imports/'+value)

    }, 1000)
    

  }

  const handleChange = (event) => {
	setValue(event.target.value)
  }
  
  const handleClear = () => {
    setValue('');
    
    // remove any previous errors
    setSisError(null)
    
    // hide results
    setHideResults(true)
    
    // focus the input again
    inputRef.current?.focus(); 
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

		{<Text color="danger"><br/><br/>TO DO: 
		<ul>
		<li>Fails sometimes with Token fails to load</li>
		<li>the Error Message flashes up</li>
		<li>Return should submit</li>
		<li>abstract auth into utils</li>
		<li>abstract common presentation code for sis import details from both sis import pages</li></ul></Text>}
		
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
            			messages={missingImportMessage()}
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
        
        {console.log("hide rez = "+hideResults)}
        	
		{sisImport && !hideResults  && <List>
		            
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