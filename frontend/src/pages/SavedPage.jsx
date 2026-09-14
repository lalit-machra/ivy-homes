import { ListingCard } from '@/components/ListingCard'
import { useData } from '@/context/DataContext'

export function SavedPage() {
  const { listings, savedIds, isSaved, toggleSaved, loading } = useData()
  const saved = listings.filter((l) => savedIds.includes(l.listing_id))

  if (loading) return <p className="text-muted-foreground">Loading…</p>

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Saved listings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Stored on this device for {savedIds.length} listing
        {savedIds.length === 1 ? '' : 's'} — the favourites API does not exist.
      </p>
      {saved.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              href={`/listings/${listing.listing_id}`}
              saved={isSaved(listing.listing_id)}
              onToggleSave={toggleSaved}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
          Nothing saved yet. Open a listing and tap Save.
        </div>
      )}
    </div>
  )
}
