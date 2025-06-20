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
  const [sisImportUrl, setSisImportUrl] = useState(null) 
  const [sisError, setSisError] = useState(null)
  const [value, setValue] = useState('') // Test value
  const inputRef = useRef(null);
  const [submittedValue, setSubmittedValue] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (!token) return
    
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
    setSubmittedValue(value)
    timeoutId = setTimeout(() => {
		setSisImportUrl(server+'/api/v1/accounts/'+accountId+'/sis_imports/'+value)

    }, 1000)
  }

  const handleChange = (event) => {
	setValue(event.target.value)
  }
  
  const handleClear = () => {
    setValue('');
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



return (
	
      <View as="div" padding="large">
        <Heading level="h1" as="h2">Search for SIS Import</Heading>
		
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
        
         <View as="div">
            <Text>Spinners then results</Text>
         </View>
		
		</View>
	)
}

export default SearchPage