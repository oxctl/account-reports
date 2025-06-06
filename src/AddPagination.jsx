import { Pagination } from '@instructure/ui-pagination'

export function AddPagination ({prevUrl, nextUrl, currUrl}) {
		
		function onClick(url) {
			currUrl(url)
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
        

		
}
	
export default AddPagination
	
	