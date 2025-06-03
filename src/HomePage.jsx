// HomePage.js
import React from 'react'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'
import { Text } from '@instructure/ui-text'
import { List } from '@instructure/ui-list'
import { Alert } from '@instructure/ui-alerts'


function HomePage() {
  return (

      <View as="div" padding="large">
        <Heading level="h1" as="h2">Provisioning Reports</Heading>
        <Text>There are a number of report listings, click on the tab to view.</Text>

      	<Alert
   			 variant="warning"
  			 margin="small"
   			 variantScreenReaderLabel="Warning, "
			  >	
			Not finished, see below for list of improvements 
  			
  		</Alert>
		<List>
			<List.Item>Ask for token just once</List.Item>
			<List.Item>Get vertical page positioning sorted</List.Item>
			<List.Item>Pagination of the results</List.Item>
			<List.Item>Add sentry support</List.Item>
			<List.Item>Apply Theme</List.Item>
			<List.Item>Warnings array is flattened sisImports- why aint it an array</List.Item>
		</List>
		
      </View>
  )
}

export default HomePage
