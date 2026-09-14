/**
 * Project price_min / price_max are not in rupees despite the docs.
 * Two patterns cover ~all records; a few are unusable.
 */
export function normalizeProjectPrices(project) {
  const min = Number(project.price_min)
  const max = Number(project.price_max)

  if (min < 50 && max < 50 && min <= max) {
    return {
      minInr: min * 1e7,
      maxInr: max * 1e7,
      pattern: 'crores',
    }
  }

  if (min >= 50 && max < 50) {
    return {
      minInr: min * 1e5,
      maxInr: max * 1e7,
      pattern: 'lakhs-crores',
    }
  }

  return { minInr: null, maxInr: null, pattern: 'unknown' }
}
