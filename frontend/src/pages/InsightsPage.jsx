import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/context/DataContext'
import { buildInsights } from '@/lib/analytics'
import { formatInr, formatInrFull, titleCase } from '@/lib/format'
import { Link } from 'react-router-dom'

function Stat({ label, value, hint }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-serif text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      )}
    </Card>
  )
}

export function InsightsPage() {
  const { listings, rentals, projects, loading, error, progress, assignedLocality } = useData()

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold">Market insights</h1>
        <p className="text-sm text-muted-foreground">
          Loading the full city dataset — listings {progress.listings}, rentals {progress.rentals},
          projects {progress.projects}.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  const insights = buildInsights(listings, rentals, projects, assignedLocality)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Market insights</h1>
        <p className="mt-1 text-muted-foreground">
          Computed from every retrievable record in {insights.city}. The analytics endpoint in the
          docs does not exist, so these numbers are built client-side.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total listings"
          value={insights.total_listings.toLocaleString('en-IN')}
          hint={`${insights.active_listings.toLocaleString('en-IN')} live · ${insights.inactive_listings.toLocaleString('en-IN')} inactive`}
        />
        <Stat
          label="Median price"
          value={formatInr(insights.median_price)}
          hint={formatInrFull(insights.median_price)}
        />
        <Stat
          label="Median ₹ / sqft"
          value={Math.round(insights.median_price_per_sqft).toLocaleString('en-IN')}
          hint="Live listings with a carpet area"
        />
        <Stat
          label="Unique properties"
          value={insights.unique_properties.toLocaleString('en-IN')}
          hint="Same unit listed on more than one portal counts once"
        />
      </div>

      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={`Rent in ${assignedLocality}`}
          value={formatInr(insights.total_monthly_rent)}
          hint={`${insights.assigned_rental_count} rental records`}
        />
        <Stat
          label="Mean ₹/sqft (live 2 BHK)"
          value={insights.avg_price_per_sqft_2bhk.toFixed(2)}
          hint="Excludes corrupt and enquiry-farm listings"
        />
        <Stat
          label="Posted in last 7 days"
          value={insights.listings_last_7_days}
          hint="Window ending 10 Sep 2026 IST"
        />
        <Stat
          label="Costliest project"
          value={insights.costliest_project?.apartment_name || '—'}
          hint={
            insights.costliest_project
              ? `${insights.costliest_project.project_id} · max ${formatInr(insights.costliest_project.price_max_inr)}`
              : ''
          }
        />
      </div>

      {insights.corrupt.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Corrupt listing IDs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.corrupt.map(({ listing, reasons }) => (
              <Link
                key={listing.listing_id}
                to={`/listings/${listing.listing_id}`}
                className="rounded-md border bg-secondary px-2 py-1 text-xs hover:border-primary"
                title={reasons.join(', ')}
              >
                {listing.listing_id}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
