import { useCallback, useMemo, useState } from 'react'
import { FilterBar, applyListingFilters, emptyFilters } from '@/components/FilterBar'
import { InfiniteGrid } from '@/components/InfiniteGrid'
import { ListingCard } from '@/components/ListingCard'
import { useData } from '@/context/DataContext'
import { isLive } from '@/lib/format'

const PAGE = 18

export function RentalsPage() {
  const { rentals, loading, error } = useData()
  const [filters, setFilters] = useState(emptyFilters)
  const [liveOnly, setLiveOnly] = useState(true)
  const [visible, setVisible] = useState(PAGE)

  const localities = useMemo(
    () => [...new Set(rentals.map((l) => l.locality).filter(Boolean))].sort(),
    [rentals],
  )

  const filtered = useMemo(() => {
    const base = liveOnly ? rentals.filter(isLive) : rentals
    return applyListingFilters(base, filters)
  }, [rentals, filters, liveOnly])

  const shown = filtered.slice(0, visible)

  const onLoadMore = useCallback(() => {
    setVisible((n) => Math.min(n + PAGE, filtered.length))
  }, [filtered.length])

  if (loading) return <p className="text-muted-foreground">Loading rentals…</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Rentals</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString('en-IN')} matching · prices are monthly rent in rupees.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={liveOnly}
            onChange={(e) => {
              setLiveOnly(e.target.checked)
              setVisible(PAGE)
            }}
          />
          Live only
        </label>
      </div>
      <FilterBar
        localities={localities}
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          setVisible(PAGE)
        }}
      />
      <InfiniteGrid
        items={shown}
        hasMore={shown.length < filtered.length}
        onLoadMore={onLoadMore}
        empty="No rentals match these filters."
        renderItem={(listing) => (
          <ListingCard
            key={listing.listing_id}
            listing={listing}
            href={`/rentals/${listing.listing_id}`}
          />
        )}
      />
    </div>
  )
}
