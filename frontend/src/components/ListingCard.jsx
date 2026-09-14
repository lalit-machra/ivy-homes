import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatArea, formatInr, isLive, titleCase } from '@/lib/format'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ListingCard({ listing, saved, onToggleSave, href }) {
  const live = isLive(listing)

  return (
    <Card className="overflow-hidden py-0 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <Link to={href} className="block p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-lg leading-tight font-semibold">
                {listing.apartment_name || listing.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {titleCase(listing.locality)} · {titleCase(listing.property_type)}
              </p>
            </div>
            <p className="shrink-0 font-serif text-lg font-semibold text-primary">
              {formatInr(listing.price)}
              {href?.startsWith('/rentals') ? (
                <span className="block text-right text-xs font-sans font-normal text-muted-foreground">
                  / month
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {listing.bedroom != null && <Badge variant="secondary">{listing.bedroom} BHK</Badge>}
            {listing.carpet_area != null && (
              <Badge variant="secondary">{formatArea(listing.carpet_area)}</Badge>
            )}
            {listing.furnishing && (
              <Badge variant="outline">{titleCase(listing.furnishing)}</Badge>
            )}
            {!live && <Badge variant="destructive">Inactive</Badge>}
            {listing.is_verified && <Badge>Verified</Badge>}
          </div>
        </Link>
        {onToggleSave && (
          <div className="flex justify-end border-t px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleSave(listing.listing_id)}
            >
              <Heart className={saved ? 'fill-accent text-accent' : ''} />
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
