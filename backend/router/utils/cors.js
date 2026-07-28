// Whitelist origin cho CORS, cấu hình qua env CORS_ORIGINS (phân tách bởi dấu phẩy).
// Ví dụ: CORS_ORIGINS=https://app.example.com,https://admin.example.com
// - Có cấu hình: chỉ phản chiếu origin nằm trong whitelist (+ cho phép credentials).
// - Bỏ trống: fallback '*' (chỉ nên dùng khi dev; production luôn nên set whitelist).
const allowList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Gán các header CORS phù hợp vào response dựa theo Origin của request.
function setCors(req, res) {
  const origin = req?.headers?.origin;

  if (allowList.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return;
  }

  if (origin && allowList.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  // Origin không thuộc whitelist => không set header => trình duyệt chặn cross-origin.
}

module.exports = setCors;
