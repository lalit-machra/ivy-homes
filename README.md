# Ivy Homes — Property Platform

## How to run

**Frontend:**
```
cd frontend
npm install
npm run dev
```

Requires `.env` with the API base URL and your API key (see `/frontend/.env.example`). View the
project live - **[🚀 Live Demo](https://ivy-homes-cyan.vercel.app/)**

**Exploration scripts** (optional — not required to run the app):

```
cd exploration
npm install
node scripts/fetch-all.js  # pulls full dataset to exploration/data
node scripts/analyze.js  # computes the answers for submission.json
```

See `exploration/README.md` for what each file covers.

## Tools used

Built with React, Tailwind, and shadcn/ui. Used Postman for initial API exploration and testing,
Claude as a supporting tool for hypothesis testing and reviewing findings, and Cursor for
frontend development, with its output reviewed and refined manually.

## How I worked out what to distrust

Started by testing every documented endpoint and parameter directly in Postman before writing any
frontend code — `auth` first (since everything else depends on it), then listings, rentals,
and projects. Two patterns emerged quickly: the documentation was right about *shapes* (what fields exist,
general structure) far more often than it was right about *mechanics* (pagination, which filters actually
work, what units numbers are in) — so mechanics got tested exhaustively, using both extreme values and edge
cases, rather than trusting anything a single sample response implied.

Once endpoint behavior was mapped, pulled the full dataset locally via a script using the confirmed-working pagination contract (`offset` + `has_more` — `total` and `page` were both found broken early
on) and did all further analysis — corrupt/fake listing detection, duplicate-property matching,
the ten questions — against that static data rather than the live API.

Full reasoning and entire thinking process including dead ends, lives in `exploration/notes/` and
`exploration/notes/questions.md`

## What I checked that turned out fine

- `/health` matches its documentation exactly, including the IST-offset server clock.
- `property_type` and `bhk`/`bedroom` filters work correctly and completely on `/v1/listings` — confirmed
by summing counts per documented type against the full dataset total.
- `locality` filtering works correctly, just case-insensitively rather than requiring lowercase as documented.
- The API's own error messages are genuinely useful, as promised — an expired token returns a clear message
pointing to `/auth/refresh`, and a missing required field on `/auth/login` names the exact field.
- Wrong login credentials correctly return 401; all three demo users behave identically and see the same data.
- Certain endpoints like `/v1/listing/{listing_id}`, `/v1/projects/{project_id}`, `/v1/rentals/{listing_id}`
work as expected.
- field conventions on listing object — money (rupees, int), area (sqft, int), timestamps (ISO 8601, Z suffix)
all match documented conventions

## What I'd do with another two days

- Test refresh token rotation and reuse behavior properly (found the old refresh token remains valid
after refreshing once, but didn't fully map single-use vs. indefinite reuse).
- Extend the duplicate-property detection (Q2) with a proper similarity threshold on `description` text,
rather than relying only on structured fields — two listings for the same property with very different structured data but near-identical descriptions would currently be missed.
- Add the "similar listings" feature client-side, replicating the documented (but non-existent) `/v1/listings/{id}/similar` logic — same locality, same bedroom count, price within 15% — since the doc conveniently specifies
the exact matching rule to use.
- Improve performance for larger datasets by moving filtering, pagination, and duplicate detection closer to the
API instead of loading and processing the full dataset client-side.
