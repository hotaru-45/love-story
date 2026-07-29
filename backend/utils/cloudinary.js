const crypto = require('crypto');
const { CLOUDINARY } = require('../constants');

// Upload 1 file (Buffer) lên Cloudinary qua REST API có ký (signed upload) —
// dùng fetch/FormData sẵn có của Node 18+, không cần thêm SDK `cloudinary`.
// Cần vì Render free tier xoá sạch đĩa local mỗi khi container khởi động lại
// (deploy mới hoặc service tự "ngủ" rồi thức dậy) — ảnh lưu ở uploads/ sẽ mất.
async function uploadToCloudinary(buffer, filename) {
  const { CLOUD_NAME, API_KEY, API_SECRET } = CLOUDINARY;
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Thiếu cấu hình CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${API_SECRET}`).digest('hex');

  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('api_key', API_KEY);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || 'Upload Cloudinary thất bại');
  }
  return json.secure_url;
}

module.exports = { uploadToCloudinary };
