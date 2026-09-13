## Listings

### Endpoints checked
`/v1/listings`,

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| Response object fields | `total`, `page`, `page_size` and `results`  | `limit`, `offset`, `count`, `total`, `has_more`, and `results` |
| Listing status | returns only active listings in your city; inactive, expired and withdrawn listings are excluded server-side | returned records include `is_live: false` listings, meaning inactive/non-live listings are not filtered out server-side |
| `page` parameter | collection endpoints accept `page` for pagination | `page` does not affect the returned results |
| `limit` maximum | maximum `limit` is 200 | `limit=200` returns only 50 results; the effective maximum is 50 |
| `total` count | `total` is the exact number of records matching the filters | `total=3391`, but pagination remains available until 3500 records have been retrieved |
| `locality` case sensitivity | exact match, lowercase required | case-insensitive — same results regardless of casing |
| `min_price` / `max_price` | filters by price range, inclusive | no effect at all — tested extreme low and high values on both, results unchanged in every case |
| `furnishing` | filters by unfurnished/semi-furnished/fully-furnished | no effect — tested all three values, results unchanged in every case |
| `sort_by=posted_at` | sorts by posting date | mostly correct oldest→newest, but a subset of records land out of sequence |
| `order` | asc (default) / desc | always ascending regardless of value |
| `project_id` as listings filter | implied to work (per projects doc) | no effect — must filter client-side |


### Confirmed Working (useful for frontend design)
- offset-based pagination works correctly — no overlaps or gaps between consecutive pages
- `bhk` correctly filters with number of bedrooms.
- `property_type` filter is accurate — sum of counts per documented type (apartment, villa, independent house, plot,   builder floor) equals the full dataset total (3500), confirming no missing/unexpected property_type values exist.
- `GET /v1/listing/{listing_id}` works as expected returning a single listing only.
- field conventions on listing object — money (rupees, int), area (sqft, int), timestamps (ISO 8601, Z suffix) all match documented conventions; no missing or renamed fields in a sample check.
