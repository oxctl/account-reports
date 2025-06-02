// SisImportsPage.js
import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { Pagination } from '@instructure/ui-pagination'

function SisImportsPage({ token }) {
  const [sisImports, setSisImports] = useState({ sis_imports: [] })
  const [sisError, setSisError] = useState(null)
  
  function prettifyWarnings ( warningsArray) {
	
 	 if (!warningsArray || warningsArray.length === 0) {
   	 	return "No warnings";
	 }
	 
	 console.log("number of warnings: "+warningsArray.length)

 	 return warningsArray.join(": ");		
  }

  useEffect(() => {
    if (!token) return

    fetch('https://tools-dev.canvas.ox.ac.uk/api/v1/accounts/1/sis_imports', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        return response.json()
      })
      .then(setSisImports)
      .catch((err) => {
        console.error('Fetch error (SIS):', err)
        setSisError(err.message)
      })
  }, [token])

  return (

      <View as="div" padding="large">
        <Heading level="h1" as="h2">List of SIS Imports</Heading>
        {sisError && <Text color="danger">{sisError}</Text>}

		<Text color="danger">TO DO processing_warings seems to be a flattened array</Text>

        <List>
          {sisImports.sis_imports.slice(0, sisImports.sis_imports.length).map((sis) => {
            const {
              id,
              created_at,
              ended_at,
              workflow_state,
              user: { name } = {},
              errors_attachment: { url } = {},
              processing_warnings 
            } = sis  
            
            
            /* TO DO processing_warings seems to be a flattened array */          

            return (
              <List.Item key={id} margin="small 0">
                <Text as="span" weight="bold">SIS Import ID: {id}</Text>
                <List isUnstyled>
                  <List.Item>User: {name}</List.Item>
                  <List.Item>Date: {ended_at ? new Date(ended_at).toLocaleString() : 'N/A'}</List.Item>
                  <List.Item>
                    Errors:&nbsp;
                    <Link href={url} rel="noopener noreferrer">
                      <Text as="span">{url ? url : 'No errors'}</Text>
                    </Link>
                  </List.Item>

                  <List.Item>Warnings:&nbsp;{prettifyWarnings(processing_warnings)}</List.Item>
                </List>
              </List.Item>
            )
          })}
        </List>
      </View>
    
  )
}

export default SisImportsPage
