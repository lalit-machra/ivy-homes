import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAll } from '@/api/client'
import { loadSavedIds, persistSavedIds } from '@/lib/saved'
import { useAuth } from '@/context/AuthContext'

const DataContext = createContext(null)
let memoryCache = null
const ASSIGNED_LOCALITY = import.meta.env.VITE_ASSIGNED_LOCALITY

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [rentals, setRentals] = useState([])
  const [projects, setProjects] = useState([])
  const [progress, setProgress] = useState({ listings: 0, rentals: 0, projects: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedIds, setSavedIds] = useState(() => loadSavedIds(user?.email))

  useEffect(() => {
    setSavedIds(loadSavedIds(user?.email))
  }, [user?.email])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (memoryCache) {
        setListings(memoryCache.listings)
        setRentals(memoryCache.rentals)
        setProjects(memoryCache.projects)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const [l, r, p] = await Promise.all([
          fetchAll('/v1/listings', {
            onProgress: (n) => {
              if (!cancelled) setProgress((s) => ({ ...s, listings: n }))
            },
          }),
          fetchAll('/v1/rentals', {
            onProgress: (n) => {
              if (!cancelled) setProgress((s) => ({ ...s, rentals: n }))
            },
          }),
          fetchAll('/v1/projects', {
            onProgress: (n) => {
              if (!cancelled) setProgress((s) => ({ ...s, projects: n }))
            },
          }),
        ])
        if (cancelled) return
        memoryCache = { listings: l, rentals: r, projects: p }
        setListings(l)
        setRentals(r)
        setProjects(p)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      listings,
      rentals,
      projects,
      loading,
      error,
      progress,
      assignedLocality: ASSIGNED_LOCALITY,
      savedIds,
      isSaved: (id) => savedIds.includes(id),
      toggleSaved: (id) => {
        setSavedIds((curr) => {
          const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
          persistSavedIds(user?.email, next)
          return next
        })
      },
    }),
    [listings, rentals, projects, loading, error, progress, savedIds, user?.email],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
