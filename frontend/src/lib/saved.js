const prefix = 'ivy-saved:'

export function loadSavedIds(email) {
  if (!email) return []
  try {
    const raw = localStorage.getItem(prefix + email.toLowerCase())
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function persistSavedIds(email, ids) {
  if (!email) return
  localStorage.setItem(prefix + email.toLowerCase(), JSON.stringify(ids))
}
