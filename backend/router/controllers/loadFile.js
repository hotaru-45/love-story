const path = require('path');

const verifyToken = require('../utils/verifyToken');
const staticfile = require('../utils/staticfile');
const setCors = require('../utils/cors');

// love-story-settings/* chứa ảnh nền hero/final hiển thị ngay ở trang Login,
// TRƯỚC khi có token — nên phải public. Tên file là UUID ngẫu nhiên (không
// đoán được), các thư mục khác (story-chapters/, gallery-photos/...) vẫn
// yêu cầu xác thực như cũ.
const PUBLIC_FOLDERS = ['love-story-settings'];

function isPublicPath(pathname) {
  const folder = pathname.split('/')[0];
  return PUBLIC_FOLDERS.includes(folder);
}

// GET /load-file/* — trả file trong uploads/ sau khi xác thực token
function loadFileHandler(req, res, params) {
  setCors(req, res);

  if (!isPublicPath(params['*'] || '') && !verifyToken(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  const uploadsRoot = path.resolve(path.join(__dirname, '../../uploads'));
  const filePath = path.resolve(path.join(__dirname, '../../uploads', params['*']));
  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Forbidden' }));
  }
  staticfile(filePath, req, res);
}

module.exports = loadFileHandler;
