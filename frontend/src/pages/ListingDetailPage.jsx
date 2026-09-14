import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getListing } from '@/api/client'
import { ListingCard } from '@/components/ListingCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { formatArea, formatDate, formatInr, formatInrFull, isLive, titleCase } from '@/lib/format'
import { Heart } from 'lucide-react'

export function ListingDetailPage() {
  const { id } = useParams()
  const { listings, isSaved, toggleSaved } = useData()
  const cached = listings.find((l) => l.listing_id === id)
  const [listing, setListing] = useState(cached || null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cached) {
      setListing(cached)
      return
    }
    let cancelled = false
    getListing(id)
      .then((data) => {
        if (!cancelled) setListing(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id, cached])

  if (error) return <p className="text-destructive">{error}</p>
  if (!listing) return <p className="text-muted-foreground">Loading listing…</p>

  const rows = [
    ['Locality', titleCase(listing.locality)],
    ['Type', titleCase(listing.property_type)],
    ['Bedrooms', listing.bedroom],
    ['Bathrooms', listing.bathroom],
    ['Balcony', listing.balcony],
    ['Floor', `${listing.floor} / ${listing.total_floors}`],
    ['Furnishing', titleCase(listing.furnishing)],
    ['Facing', titleCase(listing.facing_direction)],
    ['Parking', listing.covered_parking],
    ['Carpet area', formatArea(listing.carpet_area)],
    ['Super built-up', formatArea(listing.super_built_up_area)],
    ['Posted by', `${titleCase(listing.posted_by)} · ${listing.posted_by_name}`],
    ['Contact', listing.posted_by_contact],
    ['Posted', formatDate(listing.posted_at)],
    ['Source', listing.website],
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{listing.listing_id}</p>
          <h1 className="font-serif text-3xl font-semibold">{listing.apartment_name}</h1>
          <p className="mt-1 text-muted-foreground">
            {titleCase(listing.locality)} · {formatInrFull(listing.price)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{formatInr(listing.price)}</Badge>
            {!isLive(listing) && <Badge variant="destructive">Inactive</Badge>}
            {listing.is_verified && <Badge>Verified</Badge>}
          </div>
        </div>
        <Button variant={isSaved(listing.listing_id) ? 'default' : 'outline'} onClick={() => toggleSaved(listing.listing_id)}>
          <Heart className={isSaved(listing.listing_id) ? 'fill-current' : ''} />
          {isSaved(listing.listing_id) ? 'Saved' : 'Save listing'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{listing.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm font-medium">{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
          {listing.project_id && (
            <p className="text-sm">
              Project:{' '}
              <Link className="underline" to={`/projects/${listing.project_id}`}>
                {listing.project_id}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
