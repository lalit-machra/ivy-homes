## Rentals

### Endpoints checked
`/v1/rentals`

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| `is_live` | not documented for rentals | present, undocumented — same as listings |
| `page` parameter | 1-indexed pagination | no effect — same as listings, offset-based |
| `order` | asc/desc | always ascending, same as listings |
| `sort_by=posted_at` | sorts by posting date | mostly correct, some records out of sequence — same pattern as listings |

### Confirmed Working
- offset-based pagination works correctly — no overlaps or gaps between consecutive pages
- `bhk` correctly filters with number of bedrooms.
- `sort_by` works correctly for `price`, `carpet_area`, and `bedroom`
- `GET /v1/rentals/{listing_id}` works as expected returning a single rental only.
- field conventions on listing object — money (rupees, int), area (sqft, int), timestamps (ISO 8601, Z suffix) all match documented conventions; no missing or renamed fields in a sample check.
- furnishing filter — works correctly here (unlike listings, where furnishing had no effect at all)