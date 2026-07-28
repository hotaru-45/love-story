// Lọc field nhạy cảm (password, token, authorization, cookie...) trước khi ghi log.
// Dùng cho log_API (graphql.js) và log_login (Login.js) để không lưu plaintext
// mật khẩu / token vào DB.

const REDACTED = '[REDACTED]';

// Các key nhạy cảm — so khớp một phần tên key (đã lowercase).
const SENSITIVE_KEY_PATTERNS = ['password', 'pass', 'token', 'secret', 'cookie', 'otp', 'pin', 'authorization', 'x-api-key', 'x-access-token', 'x-refresh-token'];
// Header nhạy cảm — so khớp chính xác tên header (đã lowercase).
const SENSITIVE_HEADERS = ['token', 'cookie', 'set-cookie', 'authorization', 'x-api-key', 'x-access-token', 'x-refresh-token'];

function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => k.includes(p));
}

function redactDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = isSensitiveKey(key) ? REDACTED : redactDeep(value[key]);
    }
    return out;
  }
  return value;
}

function sanitizeVariables(variables) {
  if (variables === null || variables === undefined) return variables;
  if (typeof variables === 'string') {
    try {
      return JSON.stringify(redactDeep(JSON.parse(variables)));
    } catch (e) {
      return REDACTED;
    }
  }
  return redactDeep(variables);
}

function sanitizeToken(value) {
  if (typeof value === 'string' && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(value)) {
    return REDACTED;
  }
  return value;
}

// Lọc header nhạy cảm. Không phân biệt hoa thường tên header.
function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') return headers;
  const out = {};
  for (const key of Object.keys(headers)) {
    out[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? REDACTED : headers[key];
  }
  return out;
}

module.exports = { sanitizeVariables, sanitizeHeaders, sanitizeToken };
