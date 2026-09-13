## Projects

### Endpoints checked
`/v1/projects`

### Tools used
Postman

### Doc vs Observed Behavior

| Field | Doc | Observed |
|---|---|---|
| Project prices | `price_min` and `price_max` are INR | Values such as `price_min=1.66` and `price_max=4.54` are returned, which are consistent with crore-denominated prices rather than INR integers |
| price_min vs price_max | min represents lower bound, max upper bound | some records have min > max (e.g. min: 88.2, max: 2.4) — internally impossible |
| `page` parameter | 1-indexed pagination | no effect — same as listings, offset-based |
| `order` | asc/desc | always ascending, same as listings |

### Confirmed Working
- `GET /v1/projects/{project_id}` — returns correct single project object
- `project_id` linkage from listings resolves correctly
- `sort_by` on `price_min`, `price_max`, `launch_date`, `total_units` — all sort correctly
- `locality` filter is working fine
- `project-status` filter is also working fine

### Inconsistency
Data values that relate between listings and projects need to be checked thoroughly. Several
inconsistencies have been found - more number of listings than specified in the project, listings
not in price range as specified in the project. Analyzing these is not possible in Postman,
hence we'll rely on scripts.