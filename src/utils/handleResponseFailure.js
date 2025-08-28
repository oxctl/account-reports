/**
 * Deals with the situation where the end-user gets a 403 when making a request. 
 This can be due to them not having an LTI token or some other issue. 
 If the error is a 403 then the second function argument deals with it.
 *
 * @param {string} response - HTTP response status code
 * @param {Object} handle403 - function to deal with a 403 response, ie, authenticate the user
 */
export function handleResponseFailure(response, handle403) {
  if (response.status === 403) {
    handle403();
    throw new Error();
  } else if (response.status === 401) {
    const authHeader = response.headers.get("WWW-Authenticate");
    if (authHeader && !authHeader.includes("proxy")) {
      handle403();
      throw new Error();
    } else {
      // user nenver sees this error, just get stuck in an auth loop - ------------------------------------------
      throw new Error(response.status + 
        " you don't have permission or your session has expired, please try relaunching the tool.");
    }
  } else if (response.status === 400) {
    const err = "400 error - Bad Request.";
    console.error(err);
    throw new Error(err);
  } else if (response.status === 404) {
    const err = "404 error - Not Found.";
    console.error(err);
    throw new Error(err);
  } else {
    throw new Error(response.status + " error - Bad Response.");
  }
}
