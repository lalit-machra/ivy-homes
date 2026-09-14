import { Input } from '@/components/ui/input'
import { titleCase } from '@/lib/format'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FilterBar({
  localities,
  filters,
  onChange,
  showPrice = true,
  showFurnishing = true,
  extra,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="mb-6 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1.5">
        <Label>Locality</Label>
        <Select value={filters.locality} onValueChange={(v) => set('locality', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All localities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All localities</SelectItem>
            {localities.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {titleCase(loc)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Bedrooms</Label>
        <Select value={filters.bhk} onValueChange={(v) => set('bhk', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any BHK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any BHK</SelectItem>
            {['1', '2', '3', '4', '5'].map((n) => (
              <SelectItem key={n} value={n}>
                {n} BHK
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showFurnishing && (
        <div className="space-y-1.5">
          <Label>Furnishing</Label>
          <Select value={filters.furnishing} onValueChange={(v) => set('furnishing', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
              <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
              <SelectItem value="fully-furnished">Fully-furnished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {showPrice && (
        <>
          <div className="space-y-1.5">
            <Label>Min price (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="No min"
              value={filters.minPrice}
              onChange={(e) => set('minPrice', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max price (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="No max"
              value={filters.maxPrice}
              onChange={(e) => set('maxPrice', e.target.value)}
            />
          </div>
        </>
      )}
      {extra}
    </div>
  )
}

export const emptyFilters = {
  locality: 'all',
  bhk: 'all',
  furnishing: 'all',
  minPrice: '',
  maxPrice: '',
}

export function applyListingFilters(items, filters) {
  return items.filter((item) => {
    if (filters.locality !== 'all' && item.locality !== filters.locality) return false
    if (filters.bhk !== 'all' && String(item.bedroom) !== filters.bhk) return false
    if (filters.furnishing !== 'all' && item.furnishing !== filters.furnishing) return false
    const min = Number(filters.minPrice)
    const max = Number(filters.maxPrice)
    if (filters.minPrice && Number.isFinite(min) && item.price < min) return false
    if (filters.maxPrice && Number.isFinite(max) && item.price > max) return false
    return true
  })
}
