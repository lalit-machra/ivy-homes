const CORRUPT_CHECKS = {
  'Carpet larger than super built-up': (l) => l.carpet_area > l.super_built_up_area,
  'Floor above total floors': (l) => l.floor > l.total_floors,
  'Non-positive price': (l) => l.price <= 0,
  'Non-positive area': (l) => l.carpet_area <= 0 || l.super_built_up_area <= 0,
  'Zero bedrooms on a non-plot': (l) => l.bedroom === 0 && l.property_type !== 'plot',
  'Bathrooms far exceed bedrooms': (l) => l.bathroom > l.bedroom + 3,
  'Negative floor': (l) => l.floor < 0,
}

export function findCorruptListings(listings) {
  const byId = new Map()
  for (const [reason, fn] of Object.entries(CORRUPT_CHECKS)) {
    for (const listing of listings) {
      if (!fn(listing)) continue
      const existing = byId.get(listing.listing_id) || { listing, reasons: [] }
      existing.reasons.push(reason)
      byId.set(listing.listing_id, existing)
    }
  }
  return [...byId.values()]
}

const FAKE_NAME_THRESHOLD = 3

export function findFakeListings(listings) {
  const phoneToNames = new Map()
  for (const listing of listings) {
    const phone = listing.posted_by_contact
    if (!phone) continue
    if (!phoneToNames.has(phone)) phoneToNames.set(phone, new Map())
    const names = phoneToNames.get(phone)
    if (!names.has(listing.posted_by_name)) names.set(listing.posted_by_name, [])
    names.get(listing.posted_by_name).push(listing)
  }

  const fakes = []
  for (const [phone, names] of phoneToNames) {
    if (names.size <= FAKE_NAME_THRESHOLD) continue
    for (const [name, group] of names) {
      for (const listing of group) {
        fakes.push({ listing, phone, nameCount: names.size, name })
      }
    }
  }
  return fakes
}

export function uniquePropertyCount(listings) {
  const roundCoord = (val) => Math.round(val * 1e3) / 1e3
  const same = (a, b) =>
    a.apartment_name === b.apartment_name &&
    a.bedroom === b.bedroom &&
    Math.abs(a.floor - b.floor) <= 1 &&
    Math.abs(a.carpet_area - b.carpet_area) <= 100

  const buckets = new Map()
  listings.forEach((l) => {
    const key = `${roundCoord(l.latitude)}_${roundCoord(l.longitude)}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(l)
  })

  const parent = new Map()
  const find = (id) => {
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)))
    return parent.get(id)
  }
  const union = (a, b) => parent.set(find(a), find(b))
  listings.forEach((l) => parent.set(l.listing_id, l.listing_id))

  buckets.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (same(group[i], group[j])) union(group[i].listing_id, group[j].listing_id)
      }
    }
  })

  return new Set(listings.map((l) => find(l.listing_id))).size
}
