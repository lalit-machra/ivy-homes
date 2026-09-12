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
| User object | email, name | email |
| Logout | Invalidates the current token server side | access_token still usable after logging out

### Confirmed Working (useful for frontend design)

- Proper validation errors are thrown when trying to login with missing credentials.
- Returns 401 when a user with wrong credentials tries to log in.
- If a request is made using an expired access_token, it throws a clean 401 error stating access token expired.
- Upon POST /auth/refresh, new access_token and refresh_token are provided and session can continue.
- All three demo users show same listings.