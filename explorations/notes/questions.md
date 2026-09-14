# Answers — thinking process

Reference for how each of the 10 answers in submission.json was
derived. The actual thought process is being documented here.

All data referenced below comes from a single full pull of endpoints `/v1/listings`,
`/v1/rentals`, and `/v1/projects`  made once via `explorations/scripts/fetch-all.js`.
Every question is answered by analyzing that local dataset, not by making further
API calls. All computation described below lives in `explorations/scripts/analyze.js`.
The questions were solved in same order as given below.

---

## Q1 — total_listing_records

**Method:** paginated `/v1/listings` via `offset` + `has_more` until `has_more` was false

**Result:** 3500

---

## Q3 — active_listings

**Method:** count of retrievable listings (3500) where `is_live` is true.

**Result:** 2792

---

## Q5 — total_monthly_rent

**Method:** sum of `price` across retrievable rentals filtered to assigned locality.
Cross-checked count (153) against a live locality-filtered Postman request on `/v1/rentals`,
which was found matching.

**Result:** 5457800

---

## Q8 — listings_last_7_days

**Method:** count of retrievable listings where `posted_at` (UTC) falls in
[REFERENCE - 7 days, REFERENCE), compared as absolute timestamps to avoid manual offset math.

**Result:** 129

---

## Q7 — costliest_project

**Problem:** `price_min`/`price_max` are not in rupees despite the doc's claim, and it wasn't
clear whether to treat them as lakhs, crores, or something else — raw values fell into
different ranges across projects with no single obvious unit.

**Method:** for each project, compared `price_min` and `price_max` against the average of all real
listing prices (known-correct, in rupees) for that `project_id`, converted it in lakhs and
in crores. Three patterns emerged:
- **Most projects** (~1–10 range): both fields fit as crores.
  > id P60037, price_min: 1.23 | price_max: 2.61 | Avg price(lakhs): 165.16 | Avg price (crores): 1.65
- **A subset** (min ~50–99, max ~1–10): min fits as lakhs, max as crores. Initially looked
    like a min>max error; actually two units in one record.
  > id P60372, price_min: 84.3 | price_max: 3.69 | Avg price(lakhs): 172.23 | Avg price (crores): 1.72
- **3 projects** (P60090, P60179, P60273; both fields ~50–99): no combination fits — excluded, logged as a  data_quality finding.
  > id P60090, price_min: 55.8 | price_max: 98.9 | Avg price(lakhs): 179.275 | Avg price (crores): 1.79275

**Result:** 58300000

---

## Q10 — projects_with_wrong_listing_count

**Problem:** the question asks how many projects report a wrong listing count, but doesn't define what
"correct" means, and unlike Q3 it never uses the word "active" or "live" — needed to decide between
reading "listings it has" as raw linked listings or only currently-live ones.

**Method:** tested both definitions against `total_listings`. mismatch count of raw count of all listings
linked by `project_id `— 295/400 (quite high) whereas mismatch count of only `is_live: true` linked listings
— 106/400. But since the question's wording doesn't mention active/live status anywhere, decided to go with
295/400 mismatches.

**Result:** 295

---

## Q2 — unique_properties

**Problem:** the same physical property can appear as multiple listing records (e.g. listed on different
portals), so a raw count of records overstates the number of distinct properties.

**Method:** grouped listings first by `latitude`/`longitude` (rounded to 3 decimal places, ~100m tolerance, to
allow minor variation between sources), then within each coordinate group, matched on:
- `apartment_name` — exact match
- `bedroom` — exact match
- `floor` — within ±1
- `carpet_area` — within ±100 sqft
A known confirmed duplicate pair (100-6000047 / DWE-6002675 — found earlier while investigating the total vs retrievable count gap) was used to validate the rule.

Two additional fields were tested and dropped:
- **price** — excluding it initially blocked real duplicates from matching; different listing sites can report different
asking prices for the same unit, so it isn't a reliable identity signal.
- **facing_direction** — the known duplicate pair reported opposite directions (north vs south-west) for what is
confirmed to be the same unit, showing this field is unreliable across sources.

**Result:** 3465

---

## Q4 — corrupt_listing_ids

**Problem:** find listing records describing something physically impossible.

**Method:** tested several structural impossibility checks against the full dataset:
- `carpet_area` > `super_built_up_area` (impossible by definition)
- `floor` > `total_floors`
- `price` ≤ 0
- negative or zero area — 0 entries
- `bedroom` = 0 on a non-plot property type
- `bathroom `count far exceeding `bedroom` count — 0 entries
- negative `floor` — 0 entries

The four remaining checks each returned exactly 6 distinct listing_ids, with no overlap between groups (24 total, each
failing exactly one check) — spot-checked a sample from each group to confirm the impossibility was unambiguous.

**Result:** 24 (see submission.json)

---


## Q9 — fake_listing_ids
**Problem:** identify listings that are not real, posted to generate enquiries rather than describe an actual sale.

**Method:** grouped listings by `posted_by_contact` and counted distinct `posted_by_name` values per phone number. Distribution:
581 numbers had exactly 1 name (normal), then a sharp gap to 4-6 names with only 12 numbers total — no numbers with 2-3 names
existed in the retrievable data. This gap is a natural, unforced cutoff rather than an arbitrary threshold.

10 phone numbers had more than 3 distinct identities behind them (4 to 6 names each), tied to 13-35 listings per number. The
identities behind a single number frequently included what read as distinct agency names (e.g. "Skyline Homes," "Elite Properties,"
"Prime Realty") alongside individual names — a pattern not explainable as a small real office sharing one line, and consistent
with fabricated identities used to generate enquiries rather than sell an actual property.

Considered but did not include as a standalone signal: listings priced well below the local median for their `locality`/`bedroom`/
`property_type`.

**Result:** 202 (see submission.json)

---

## Q6 — avg_price_per_sqft_2bhk

**Method:** filtered retrievable listings to `is_live: true` and `bedroom: 2`, excluded any listing_id already in the Q4 (corrupt) or
Q9 (fake) answer sets, then averaged `price`/`carpet_area` across the remaining records.

**Result:** 27257.18