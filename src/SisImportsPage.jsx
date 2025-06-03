// SisImportsPage.js
import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { Pagination } from '@instructure/ui-pagination'

function SisImportsPage({ token, server }) {
  const [sisImports, setSisImports] = useState({ sis_imports: [] })
  const [sisError, setSisError] = useState(null)
  

  
	function AttachmentsList({ items }) {
	    
	  if (!Array.isArray(items)) return null
	
	  return (
	    <List>
	      {items.map((item, index) => (
	        <List.Item key={index}>
	          <Link href={item.url} target="_blank" rel="noopener noreferrer">
	            {item.filename}
	          </Link>
	        </List.Item>
	      ))}
	    </List>
	  )
	}
	
	function WarningsList({ items }) {
	    
	  if (!Array.isArray(items)) return null
	
	  return (
	    <List>
	      {warnings.map(([filename, message], index) => (		
	        <List.Item key={index}>
	          <strong>{filename}:</strong> {message}
	        </List.Item>
	      ))}
	    </List>
	  )
	}
	


  useEffect(() => {
    if (!token) return

    fetch(server+'/api/v1/accounts/1/sis_imports?per_page=100', {
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
              ended_at,
              user: { name } = {},
              errors_attachment: { url } = {},
              csv_attachments,
              processing_warnings 
            } = sis  
                     
            /* TO DO processing_warings seems to be a flattened array */          

            return (
              <List.Item key={id} margin="small 0">
                <Text as="span" weight="bold">SIS Import ID: {id} {name} {ended_at ? new Date(ended_at).toLocaleString() : 'N/A'}</Text>
                <List>
                  <List.Item>
                    <Text>Attachments:</Text>
                    <AttachmentsList items={csv_attachments}/>
                  </List.Item>
                  <List.Item>
                    Errors:&nbsp;
                    <Link href={url} rel="noopener noreferrer">
                      <Text as="span">{url ? url : 'No errors'}</Text>
                    </Link>
                  </List.Item>

                  <List.Item>
                  <Text>Warning messages: {processing_warnings}</Text>
                  <WarningsList warnings={processing_warnings} />
				  </List.Item>
				  
                </List>
              </List.Item>
            )
          })}
        </List>
      </View>
    
  )
}

export default SisImportsPage
