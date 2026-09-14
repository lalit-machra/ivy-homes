import { isLive, mean, median } from '@/lib/format'
import { findCorruptListings, findFakeListings, uniquePropertyCount } from '@/lib/quality'
import { normalizeProjectPrices } from '@/lib/projectPrices'

const REFERENCE = new Date('2026-09-10T00:00:00+05:30')
const WINDOW_START = new Date(REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000)

export function buildInsights(listings, rentals, projects, assignedLocality) {
  const live = listings.filter(isLive)
  const corrupt = findCorruptListings(listings)
  const fakes = findFakeListings(listings)
  const corruptIds = new Set(corrupt.map((c) => c.listing.listing_id))
  const fakeIds = new Set(fakes.map((f) => f.listing.listing_id))
  const excluded = new Set([...corruptIds, ...fakeIds])

  const prices = live.map((l) => l.price)
  const pps = live
    .filter((l) => l.carpet_area > 0)
    .map((l) => l.price / l.carpet_area)

  const eligible2bhk = live.filter(
    (l) => l.bedroom === 2 && l.carpet_area > 0 && !excluded.has(l.listing_id),
  )

  const assigned = assignedLocality?.toLowerCase()
  const assignedRentals = rentals.filter(
    (r) => r.locality?.toLowerCase() === assigned,
  )

  const listingsLast7 = listings.filter((l) => {
    const posted = new Date(l.posted_at)
    return posted >= WINDOW_START && posted < REFERENCE
  })

  let costliest = null
  for (const project of projects) {
    const { maxInr, pattern } = normalizeProjectPrices(project)
    if (pattern === 'unknown' || maxInr == null) continue
    if (!costliest || maxInr > costliest.price_max_inr) {
      costliest = {
        project_id: project.project_id,
        apartment_name: project.apartment_name,
        price_max_inr: maxInr,
      }
    }
  }

  const wrongCount = projects.filter((project) => {
    const actual = listings.filter((l) => l.project_id === project.project_id).length
    return actual !== project.total_listings
  }).length

  return {
    city: 'Gurugram',
    total_listings: listings.length,
    active_listings: live.length,
    inactive_listings: listings.length - live.length,
    unique_properties: uniquePropertyCount(listings),
    median_price: median(prices),
    median_price_per_sqft: median(pps),
    avg_price_per_sqft_2bhk: mean(
      eligible2bhk.map((l) => l.price / l.carpet_area),
    ),
    assigned_locality: assignedLocality,
    assigned_rental_count: assignedRentals.length,
    total_monthly_rent: assignedRentals.reduce((s, r) => s + (r.price || 0), 0),
    listings_last_7_days: listingsLast7.length,
    costliest_project: costliest,
    projects_with_wrong_listing_count: wrongCount,
    corrupt,
    fake_count: fakeIds.size,
    fake_phones: new Set(fakes.map((f) => f.phone)).size,
  }
}
