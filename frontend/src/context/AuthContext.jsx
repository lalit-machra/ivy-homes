import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  loginRequest,
  logoutRequest,
  readAuth,
  refreshSession,
  writeAuth,
} from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readAuth())   // load a previous session from local stroage if it exists
  const timer = useRef(null)

  const persist = (next) => {
    writeAuth(next)
    setSession(next)
  }

  // Automatically refresh the access token before it expires.
  useEffect(() => {
    if (!session?.accessToken || !session?.refreshToken) return undefined

    const schedule = () => {
      const ms = Math.max((session.expiresAt || 0) - Date.now() - 60_000, 5_000)  // we are refreshing session 1 minute early to avoid unauthorization errors
      timer.current = setTimeout(async () => {
        try {
          const next = await refreshSession()
          setSession(next)
        } catch {
          persist(null)
        }
      }, ms)
    }

    schedule()
    return () => clearTimeout(timer.current)
  }, [session?.accessToken, session?.expiresAt, session?.refreshToken])

  const value = useMemo(
    () => ({
      user: session ? { email: session.email } : null,
      isAuthenticated: Boolean(session?.accessToken),
      login: async (email, password) => {
        const data = await loginRequest(email, password)
        persist({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          email: data.user?.email || email,
          expiresAt: Date.now() + (data.expires_in || 900) * 1000,
        })
      },
      logout: async () => {
        await logoutRequest()
        persist(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
