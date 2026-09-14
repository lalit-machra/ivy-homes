const AUTH_KEY = 'ivy-auth';

export function readAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}

export function writeAuth(value) {
  if (!value) localStorage.removeItem(AUTH_KEY)
  else localStorage.setItem(AUTH_KEY, JSON.stringify(value))
}

const API_BASE = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY

function authHeaders(extra = {}) {
  const auth = readAuth()
  return {
    'X-API-Key': API_KEY,
    ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    ...extra,
  }
}

async function parseError(res) {
  let detail = `Request failed (${res.status})`
  try {
    const body = await res.json()
    if (body?.detail) detail = body.detail
  } catch {
    /* ignore */
  }
  const err = new Error(detail)
  err.status = res.status
  return err
}

let refreshPromise = null   // prevents multiple simultaneous token refresh requests

export async function refreshSession() {
  const auth = readAuth()
  if (!auth?.refreshToken) throw new Error('No refresh token')
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const attempts = [
      {
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: auth.refreshToken }),
      }
    ]

    let data = null
    let lastError = null
    for (const attempt of attempts) {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        ...attempt,
      })
      if (res.ok) {
        data = await res.json()
        break
      }
      lastError = await parseError(res)
    }
    if (!data) throw lastError
    const next = {
      ...auth,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || auth.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 900) * 1000,
    }
    writeAuth(next)
    return next
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export async function apiFetch(path, options = {}, { retry = true } = {}) {
  const { headers, body, ...rest } = options
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: authHeaders({
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry && readAuth()?.refreshToken) {
    try {
      await refreshSession()
      return apiFetch(path, options, { retry: false })
    } catch {
      writeAuth(null)
    }
  }

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return null
  return res.json()
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function logoutRequest() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' }, { retry: false })
  } catch {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' }, { retry: false })
    } catch {
      /* logout is not actually honoured server-side */
    }
  }
}

export async function fetchAll(path, { onProgress } = {}) {
  let offset = 0
  let hasMore = true
  const all = []

  while (hasMore) {
    const data = await apiFetch(
      `${path}${path.includes('?') ? '&' : '?'}limit=50&offset=${offset}`,
    )
    const results = data.results || []
    all.push(...results)
    hasMore = Boolean(data.has_more)
    offset += data.limit || 50
    onProgress?.(all.length, data.total)
    if (!results.length) break
  }

  return all
}

export async function getListing(id) {
  try {
    return await apiFetch(`/v1/listing/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) {
      return apiFetch(`/v1/listings/${encodeURIComponent(id)}`)
    }
    throw err
  }
}

export async function getRental(id) {
  return apiFetch(`/v1/rentals/${encodeURIComponent(id)}`)
}

export async function getProject(id) {
  return apiFetch(`/v1/projects/${encodeURIComponent(id)}`)
}
