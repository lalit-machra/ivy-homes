## Auth

### Endpoints checked
`/auth/login`,
`/auth/refresh`,
`/auth/logout`

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| Access token | "token" | "access_token" |
| Refresh token | There is no refresh flow | /auth/login returns a "refresh_token" |
| Token expiry | Tokens are valid for 24 hours (86400s) | Tokens are valid for 15 minutes (900s) |
| Refresh endpoint | Not documented | "refresh_url": "/auth/refresh" |
| Old refresh_token validity | Not documented | old refresh_token remains valid even after issuing new access_token and refresh_token |
| User object | email, name | email |
| Logout | Invalidates the current token server side | access_token still usable after logging out |
| API key delivery | Append it as a query parameter | query param is rejected outright with 401; X-API-Key header is required — documented method does not work at all |

### Confirmed Working (useful for frontend design)

- Proper validation errors are thrown when trying to login with missing credentials.
- Returns 401 when a user with wrong credentials tries to log in.
- If a request is made using an expired access_token, it throws a clean 401 error stating access token expired.
- Upon POST /auth/refresh, new access_token and refresh_token are provided and session can continue.
- All three demo users show same listings.