const path = require('path');

const verifyToken = require('../utils/verifyToken');
const staticfile = require('../utils/staticfile');
const setCors = require('../utils/cors');

// GET /load-file/* — trả file trong uploads/ sau khi xác thực token
function loadFileHandler(req, res, params) {
  setCors(req, res);

  if (!verifyToken(req)) {
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
