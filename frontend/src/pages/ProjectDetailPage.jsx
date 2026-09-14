import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProject } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { formatArea, formatDate, formatInr, formatInrFull, titleCase } from '@/lib/format'
import { normalizeProjectPrices } from '@/lib/projectPrices'

export function ProjectDetailPage() {
  const { id } = useParams()
  const { projects, listings } = useData()
  const cached = projects.find((p) => p.project_id === id)
  const [project, setProject] = useState(cached || null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cached) {
      setProject(cached)
      return
    }
    let cancelled = false
    getProject(id)
      .then((data) => {
        if (!cancelled) setProject(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id, cached])

  const linked = useMemo(
    () => listings.filter((l) => l.project_id === id),
    [listings, id],
  )

  if (error) return <p className="text-destructive">{error}</p>
  if (!project) return <p className="text-muted-foreground">Loading project…</p>

  const prices = normalizeProjectPrices(project)

  const rows = [
    ['Developer', project.developer_name],
    ['Locality', titleCase(project.locality)],
    ['Status', titleCase(project.project_status)],
    ['Units', project.total_units],
    ['Towers', project.total_towers],
    ['Floors', project.total_floors],
    ['Launch', formatDate(project.launch_date)],
    ['Possession', formatDate(project.possession_date)],
    ['RERA', project.rera_number],
    ['Area', `${formatArea(project.min_area_sqft)} – ${formatArea(project.max_area_sqft)}`],
    [
      'Price (corrected)',
      prices.minInr != null
        ? `${formatInrFull(prices.minInr)} – ${formatInrFull(prices.maxInr)}`
        : 'Could not convert documented units',
    ],
    ['Reported listing count', project.total_listings],
    ['Linked listings found', linked.length],
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{project.project_id}</p>
        <h1 className="font-serif text-3xl font-semibold">{project.apartment_name}</h1>
        <p className="mt-1 text-muted-foreground">{project.developer_name}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {prices.minInr != null && (
            <Badge>
              {formatInr(prices.minInr)} – {formatInr(prices.maxInr)}
            </Badge>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm font-medium">{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
          {project.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.amenities.map((a) => (
                <Badge key={a} variant="outline">
                  {titleCase(a)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
