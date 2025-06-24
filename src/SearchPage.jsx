import React, { useEffect, useState, useRef } from 'react'

import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Text } from '@instructure/ui-text'
import { TextInput } from '@instructure/ui-text-input'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { IconSearchLine, IconXSolid } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'
import { IconButton, Button } from '@instructure/ui-buttons'

import { SisImportListItem } from './SisImportListItem'

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
    	return [{type: 'newError', text: 'SIS Import not found'}]
    }
    else {
    	return []
    }
  }
  
  useEffect(() => {
    if (!token) return
    
    // make sure API call URL is set up
    if (!sisImportUrl) return
    
    fetch(sisImportUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
	
		//  hide the results
    	setHideResults(true)
    		
        if (!response.ok) {    	
	
	    	// -- this is common --	
          	if (response.status === 403) {
              handle403()
              throw new Error()
            } else if (response.status === 401) {
              const authHeader = response.headers.get('WWW-Authenticate')
              if (authHeader && !authHeader.includes('proxy')) {
                handle403()
                throw new Error()
              } else {
                throw new Error('You don\'t have permission or your session has expired, please try relaunching the tool.')
              }
            } else if (response.status === 400) {
              const err = "400 error - Bad Request."
              console.error(err)
              throw new Error(err)
            } else if (response.status === 404) {
              const err = "404 error - Not Found."
              console.error(err)
              throw new Error(err)
            } else {
              throw new Error(response.status+ ' error - Bad Response.')
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
        setSisError(err.message+' There is no SIS Import with that ID ')
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


return (
	
      <View as="div" padding="large">
        <Heading level="h1" as="h2">Search for SIS Import</Heading>

		{<Text color="danger"><br/><br/>TO DO: 
		<ul>
		<li>the Error Message flashes up</li>
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
        	
		{sisImport && !hideResults  && <List>
			<SisImportListItem key={sisImport.id} sisImport={sisImport}/>        
        </List>}
     
		
		</View>
	)
}

export default SearchPage