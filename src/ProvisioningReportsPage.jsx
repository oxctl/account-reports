// ProvisioningReportsTab.js
import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { List } from '@instructure/ui-list'
import { Heading } from '@instructure/ui-heading'
import { Link } from '@instructure/ui-link'
import { Text } from '@instructure/ui-text'
import { Pagination } from '@instructure/ui-pagination'

function ProvisioningReportsPage({ token, server }) {
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
//  const [server,setServer] = useState([])
 

  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1)
  }

  useEffect(() => {
    if (!token) return
    fetch(server+'/api/v1/accounts/1/reports/provisioning_csv', {
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
      .then(setReports)
      .catch((err) => {
        console.error('Fetch error (provisioning):', err)
        setError(err.message)
      })
  }, [token])
  
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
      </View>
   
  )
 
}

export default ProvisioningReportsPage
