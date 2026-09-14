import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRental } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { formatArea, formatDate, formatInr, formatInrFull, isLive, titleCase } from '@/lib/format'

export function RentalDetailPage() {
  const { id } = useParams()
  const { rentals } = useData()
  const cached = rentals.find((l) => l.listing_id === id)
  const [rental, setRental] = useState(cached || null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cached) {
      setRental(cached)
      return
    }
    let cancelled = false
    getRental(id)
      .then((data) => {
        if (!cancelled) setRental(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id, cached])

  if (error) return <p className="text-destructive">{error}</p>
  if (!rental) return <p className="text-muted-foreground">Loading rental…</p>

  const rows = [
    ['Locality', titleCase(rental.locality)],
    ['Type', titleCase(rental.property_type)],
    ['Bedrooms', rental.bedroom],
    ['Bathrooms', rental.bathroom],
    ['Floor', `${rental.floor} / ${rental.total_floors}`],
    ['Furnishing', titleCase(rental.furnishing)],
    ['Facing', titleCase(rental.facing_direction)],
    ['Monthly rent', formatInrFull(rental.price)],
    ['Deposit', formatInrFull(rental.deposit)],
    ['Maintenance', formatInrFull(rental.maintenance)],
    ['Carpet area', formatArea(rental.carpet_area)],
    ['Super built-up', formatArea(rental.super_builtup_area ?? rental.super_built_up_area)],
    ['Posted by', `${titleCase(rental.posted_by)} · ${rental.posted_by_name}`],
    ['Contact', rental.posted_by_contact],
    ['Posted', formatDate(rental.posted_at)],
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{rental.listing_id}</p>
        <h1 className="font-serif text-3xl font-semibold">
          {rental.title || rental.apartment_name}
        </h1>
        <p className="mt-1 text-muted-foreground">{titleCase(rental.locality)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{formatInr(rental.price)} / month</Badge>
          {!isLive(rental) && <Badge variant="destructive">Inactive</Badge>}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{rental.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm font-medium">{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
