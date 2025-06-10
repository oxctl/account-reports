import { Pagination } from '@instructure/ui-pagination'

export function AddPagination ({prevUrl, currUrl, nextUrl, setCurrUrl}) {
		
		function onClick(url) {
			setCurrUrl(url)
		}
		
		const pageNumber = currUrl.replace(/^ht.*?page=/,'').replace(/&.*$/,'')
			
         
      return (   
		  <Pagination 
		  	as="nav" 
		  	margin="small" 
		  	variant="compact"       
		  	labelNext="Next Page"
		  	labelPrev="Previous Page"
		  	>
		  	
		    {prevUrl && <Pagination.Page onClick={()=>onClick(prevUrl)}>&lt;</Pagination.Page>}
		     <Pagination.Page>{pageNumber}</Pagination.Page>
		  	{nextUrl && <Pagination.Page  onClick={()=>onClick(nextUrl)}>&gt;</Pagination.Page>}
		  	
		  </Pagination>
        )
        

		
}
	
export default AddPagination
	
	