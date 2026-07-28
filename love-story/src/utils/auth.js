const AUTH_STORAGE_KEY = 'love-story-token'
const TENANT_STORAGE_KEY = 'love-story-tenant'

export function getToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getTenant() {
  try {
    return localStorage.getItem(TENANT_STORAGE_KEY)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function setAuthenticated(token, tenant) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
    if (tenant) localStorage.setItem(TENANT_STORAGE_KEY, tenant)
  } catch {
    // localStorage unavailable (private mode, quota) — session stays in-memory only
  }
}

export function clearAuthenticated() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(TENANT_STORAGE_KEY)
  } catch {
    // no-op
  }
}
