# Misc

Endpoints documented but confirmed entirely non-existent (404 on
every method/variant tried).

## Favourites

### Endpoint checked
GET, POST, DELETE, PUT `/v1/favourites`

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| Favourites endpoint | `GET/POST/DELETE /v1/favourites` — save, list, remove | all methods return 404 not found, endpoint does not exist |

### Frontend decision
No server-side favourites support exists. For saved listings, other options like implementing it on
client-side via localStorage, keyed by the logged-in user's email, to satisfy per-user persistence
across reload and re-login maybe used.

---


## Analytics

### Endpoint checked
GET `/v1/analytics/summary`

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| Analytics summary endpoint | returns `total_listings`, `median_price`, `median_price_per_sqft`, `by_locality`, `by_bhk aggregates` | returns 404 not found — endpoint does not exist |

### Frontend decision
No server-side analytics endpoint exists. The insights screen
(Part 1, requirement 6) will compute `total_listings`, `median_price`,
`median_price_per_sqft`, `by_locality`, and `by_bhk` directly from the
full locally retrieved listings dataset instead.