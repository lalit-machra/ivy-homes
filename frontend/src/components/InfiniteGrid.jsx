import { useEffect, useRef } from 'react'

export function InfiniteGrid({ items, hasMore, onLoadMore, renderItem, empty }) {
  const sentinel = useRef(null)

  useEffect(() => {
    const node = sentinel.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) onLoadMore()
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
        {empty || 'Nothing to show with these filters.'}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      <div ref={sentinel} className="h-8" />
    </>
  )
}
