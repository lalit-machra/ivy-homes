import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { InfiniteGrid } from '@/components/InfiniteGrid'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { formatArea, formatInr, titleCase } from '@/lib/format'
import { normalizeProjectPrices } from '@/lib/projectPrices'

const PAGE = 18

export function ProjectsPage() {
  const { projects, loading, error } = useData()
  const [locality, setLocality] = useState('all')
  const [status, setStatus] = useState('all')
  const [visible, setVisible] = useState(PAGE)

  const localities = useMemo(
    () => [...new Set(projects.map((p) => p.locality).filter(Boolean))].sort(),
    [projects],
  )
  const statuses = useMemo(
    () => [...new Set(projects.map((p) => p.project_status).filter(Boolean))].sort(),
    [projects],
  )

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (locality !== 'all' && p.locality !== locality) return false
        if (status !== 'all' && p.project_status !== status) return false
        return true
      }),
    [projects, locality, status],
  )

  const shown = filtered.slice(0, visible)
  const onLoadMore = useCallback(() => {
    setVisible((n) => Math.min(n + PAGE, filtered.length))
  }, [filtered.length])

  if (loading) return <p className="text-muted-foreground">Loading projects…</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Projects</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length.toLocaleString('en-IN')} projects · prices converted from crores/lakhs,
        not the rupee integers the docs claimed.
      </p>
      <div className="mb-6 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Locality</Label>
          <Select
            value={locality}
            onValueChange={(v) => {
              setLocality(v)
              setVisible(PAGE)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
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
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              setVisible(PAGE)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {titleCase(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <InfiniteGrid
        items={shown}
        hasMore={shown.length < filtered.length}
        onLoadMore={onLoadMore}
        empty="No projects match these filters."
        renderItem={(project) => {
          const prices = normalizeProjectPrices(project)
          return (
            <Card key={project.project_id} className="py-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <Link to={`/projects/${project.project_id}`} className="block">
                  <p className="font-serif text-lg font-semibold">{project.apartment_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.developer_name} · {titleCase(project.locality)}
                  </p>
                  <p className="mt-3 font-serif text-primary">
                    {prices.minInr != null
                      ? `${formatInr(prices.minInr)} – ${formatInr(prices.maxInr)}`
                      : 'Price unavailable'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{titleCase(project.project_status)}</Badge>
                    <Badge variant="outline">{formatArea(project.min_area_sqft)} – {formatArea(project.max_area_sqft)}</Badge>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        }}
      />
    </div>
  )
}
