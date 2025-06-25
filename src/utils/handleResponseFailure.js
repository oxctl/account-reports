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
      throw new Error(
        "You don't have permission or your session has expired, please try relaunching the tool.",
      );
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
