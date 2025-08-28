import { checkOk, LoginError, UnauthorizedError } from "./utils";
test("ok response is fine", async () => {
  const response = new Response(new Blob(), { status: 200 });
  await expect(checkOk(response)).resolves.toBe(response);
});

test("error on missing token", async () => {
  const response = new Response(new Blob(), { status: 403 });
  await expect(checkOk(response)).rejects.toThrow(LoginError);
});

test("the token in the proxy is no longer valid", async () => {
  const response = new Response(new Blob(), {
    status: 401,
    headers: { "WWW-Authenticate": 'Bearer realm="canvas-lms"' },
  });
  await expect(checkOk(response)).rejects.toThrow(LoginError);
});

test("the access token does not have the required scopes", async () => {
  const response = new Response(
    new Blob([
      '{"errors":[{"message":"Insufficient scopes on access token."}],"error_report_id":1234}',
    ]),
    { status: 403 },
  );
  await expect(checkOk(response)).rejects.toThrow(LoginError);
});

test("expired token throws an error", async () => {
  // This when the proxy doesn't make a request to Canvas because the JWT is already expired.
  const response = new Response(new Blob(), {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Bearer realm="proxy", error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Jwt expired at 2000-01-10T00:00:00Z", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"',
    },
  });
  await expect(checkOk(response)).rejects.toThrow(Error);
});

test("permissions error from Canvas", async () => {
  const response = new Response(
    JSON.stringify({
      status: "unauthorised",
      errors: [{ message: "user not authorised to perform that action" }],
    }),
    { status: 401 },
  );
  await expect(checkOk(response)).rejects.toThrow(UnauthorizedError);
});
