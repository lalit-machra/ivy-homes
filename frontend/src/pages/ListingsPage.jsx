import { useCallback, useMemo, useState } from 'react'
import { FilterBar, applyListingFilters, emptyFilters } from '@/components/FilterBar'
import { InfiniteGrid } from '@/components/InfiniteGrid'
import { ListingCard } from '@/components/ListingCard'
import { useData } from '@/context/DataContext'
import { isLive } from '@/lib/format'

const PAGE = 18

export function ListingsPage() {
  const { listings, loading, error, isSaved, toggleSaved } = useData()
  const [filters, setFilters] = useState(emptyFilters)
  const [liveOnly, setLiveOnly] = useState(true)
  const [visible, setVisible] = useState(PAGE)

  const localities = useMemo(
    () => [...new Set(listings.map((l) => l.locality).filter(Boolean))].sort(),
    [listings],
  )

  const filtered = useMemo(() => {
    const base = liveOnly ? listings.filter(isLive) : listings
    return applyListingFilters(base, filters)
  }, [listings, filters, liveOnly])

  const shown = filtered.slice(0, visible)

  const onLoadMore = useCallback(() => {
    setVisible((n) => Math.min(n + PAGE, filtered.length))
  }, [filtered.length])

  const onFilterChange = (next) => {
    setFilters(next)
    setVisible(PAGE)
  }

  if (loading) return <p className="text-muted-foreground">Loading listings…</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Listings</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString('en-IN')} matching · price and furnishing are filtered
            here because the API ignores those parameters.
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
      <FilterBar localities={localities} filters={filters} onChange={onFilterChange} />
      <InfiniteGrid
        items={shown}
        hasMore={shown.length < filtered.length}
        onLoadMore={onLoadMore}
        empty="No listings match these filters."
        renderItem={(listing) => (
          <ListingCard
            key={listing.listing_id}
            listing={listing}
            href={`/listings/${listing.listing_id}`}
            saved={isSaved(listing.listing_id)}
            onToggleSave={toggleSaved}
          />
        )}
      />
    </div>
  )
}
