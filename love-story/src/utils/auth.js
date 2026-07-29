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

export const AUTH_EXPIRED_EVENT = 'love-story-auth-expired'

// Backend trả "You are not authenticated!" (xem `backend/graphql/auth/index.js`)
// khi token hết hạn (>12h) hoặc không hợp lệ. Gọi hàm này để dọn phiên đăng
// nhập và báo cho App.jsx điều hướng về trang Login thay vì đứng đơ.
export function notifyAuthExpired() {
  clearAuthenticated()
  try {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  } catch {
    // no-op (SSR hoặc môi trường không có window)
  }
}
