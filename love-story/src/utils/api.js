// Backend là project GraphQL đa tenant dùng chung (`d:/LoveStory/backend`).
// Website này chỉ có đúng 1 "công ty" (tenant) đại diện cho cặp đôi.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003'
const COMPANY_CODE = 'LOVESTORY'

const LOGIN_QUERY = `
  query Login($code_company: String!, $username: String!, $password: String!) {
    login(code_company: $code_company, username: $username, password: $password) {
      token
    }
  }
`

function mapLoginError(message) {
  if (!message) return 'Không thể kết nối máy chủ, vui lòng thử lại.'
  if (message.startsWith('error_login_102')) {
    return 'Bạn đã đăng nhập sai quá nhiều lần, vui lòng thử lại sau.'
  }
  if (message.startsWith('error_login_100')) {
    return 'Tài khoản hoặc mật khẩu chưa đúng.'
  }
  return 'Tài khoản hoặc mật khẩu chưa đúng.'
}

export async function loginRequest({ username, password }) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_QUERY,
        variables: { code_company: COMPANY_CODE, username, password },
      }),
    })
  } catch {
    return { token: null, error: 'Không thể kết nối máy chủ, vui lòng thử lại.' }
  }

  const json = await response.json().catch(() => null)
  const token = json?.data?.login?.token
  if (token) return { token, error: null }

  return { token: null, error: mapLoginError(json?.errors?.[0]?.message) }
}
