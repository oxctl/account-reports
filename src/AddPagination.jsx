import { Pagination } from "@instructure/ui-pagination";

export function AddPagination({ prevUrl, currUrl, nextUrl, setCurrUrl }) {
  const onClick = (url) => {
    setCurrUrl(url);
  };

  // Extract the current page number from the current URL (not per_page)
  const pageNumber = (() => {
    try {
      const url = new URL(currUrl);
      const page = url.searchParams.get("page");
      return page || "1";
    } catch (e) {
      // Fallback parsing if URL constructor fails
      const match = (currUrl || "").match(/[?&]page=(\d+)/);
      return match ? match[1] : "1";
    }
  })();

  return (
    <Pagination
      as="nav"
      margin="small"
      variant="compact"
      labelNext="Next Page"
      labelPrev="Previous Page"
    >
      {prevUrl && (
        <Pagination.Page onClick={() => onClick(prevUrl)}>&lt;</Pagination.Page>
      )}
      <Pagination.Page>{pageNumber}</Pagination.Page>
      {nextUrl && (
        <Pagination.Page onClick={() => onClick(nextUrl)}>&gt;</Pagination.Page>
      )}
    </Pagination>
  );
}

export default AddPagination;
