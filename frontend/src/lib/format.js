export function isLive(item) {
  return item?.is_live === true || item?.is_live === 'true'
}

export function formatInr(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n >= 1e8 ? 1 : 2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n >= 1e6 ? 1 : 2)} L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function formatInrFull(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `₹${Math.round(Number(value)).toLocaleString('en-IN')}`
}

export function formatArea(sqft) {
  if (sqft == null) return '—'
  return `${Number(sqft).toLocaleString('en-IN')} sqft`
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function titleCase(value) {
  if (!value) return '—'
  return String(value)
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function median(values) {
  const nums = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  if (!nums.length) return 0
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

export function mean(values) {
  const nums = values.filter((v) => Number.isFinite(v))
  if (!nums.length) return 0
  return nums.reduce((s, v) => s + v, 0) / nums.length
}
