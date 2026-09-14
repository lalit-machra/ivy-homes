# Exploration

Scripts, notes, and reasoning used to understand the real behavior of the API before writing
any frontend code, and to derive the answers in the top-level submission.json.

## Notes

1. **notes/auth.md** — auth flow: token shape, expiry, refresh, logout. Start here since every
other request depends on auth working correctly.

2. **notes/listings.md** — pagination, filters, sorting, and field-level findings for `/v1/listings`.
It covers why total and page cannot be trusted, and the pattern of which filters work server-side
and which don't.

3. **notes/rentals.md** — same checks applied to `/v1/rentals`, noting where behavior matches listings
and where it differs

4. **notes/projects.md** — pagination/filter checks for `/v1/projects`, plus the price_min/price_max unit investigation.

5. **notes/misc.md** — endpoints that don't fit elsewhere: `/v1/favourites` and `/v1/analytics/summary`
(both fully missing)

6. **notes/questions.md** — how each of the 10 answers in submission.json was derived. References the 
findings above and the scripts below directly.

## Scripts

- **scripts/fetch-all.js** — pulls the full dataset from `/v1/listings`, `/v1/rentals`, and `/v1/projects`
using offset and has_more (not total or page — see notes/listings.md for why), and writes it to `data/` as
JSON. Run once; everything else reads from that local data rather than making further API calls.

- **scripts/analyze.js** — loads the JSON from `data/` and computes all 10 answers in submission.json. No API calls.

## Data

`data/` holds the raw pulled JSON (listings.json, rentals.json, projects.json) and is gitignored — not committed, since it's a few thousand records including seller contact numbers.