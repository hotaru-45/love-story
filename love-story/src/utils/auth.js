const AUTH_STORAGE_KEY = 'love-story-token'

export function getToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function setAuthenticated(token) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  } catch {
    // localStorage unavailable (private mode, quota) — session stays in-memory only
  }
}

export function clearAuthenticated() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // no-op
  }
}
