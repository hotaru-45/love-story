const fs = require('fs');
const formidable = require('formidable');

const logger = require('../../logger');
const parseCookies = require('../utils/parseCookies');
const verifyToken = require('../utils/verifyToken');
const setCors = require('../utils/cors');
const { uploadToCloudinary } = require('../../utils/cloudinary');
const { UploadFiles } = require('../../models');

function uploadHandler(req, res, params) {
  const tenant = req?.headers?.tenant || parseCookies(req)?.tenant;

  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  setCors(req, res);

  if (!verifyToken(req)) {
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  const form = new formidable.IncomingForm({ multiples: true, keepExtensions: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.end(JSON.stringify({ error: 'Parse error' }));

    // Sanitize document_code: chỉ cho phép ký tự an toàn, chặn path traversal
    const rawId = Array.isArray(fields.document_code) ? fields.document_code[0] : fields.document_code;
    const document_code = rawId?.replace(/[^a-zA-Z0-9_\-]/g, '');

    if (!document_code || !tenant) return res.end(JSON.stringify({ error: 'Missing document_code or tenant' }));
    if (!files || Object.keys(files).length === 0) return res.end(JSON.stringify({ error: 'No files uploaded' }));

    try {
      const UploadFilesModel = UploadFiles(tenant);
      const newFiles = [];
      for (const [fieldName, fileArr] of Object.entries(files)) {
        const fileList = Array.isArray(fileArr) ? fileArr : [fileArr];
        for (const file of fileList) {
          const buffer = await fs.promises.readFile(file.filepath);
          const secureUrl = await uploadToCloudinary(buffer, file.originalFilename || 'upload');
          fs.promises.unlink(file.filepath).catch(() => {});
          const saved = await new UploadFilesModel({
            FILE: secureUrl,
            FILE_NAME: file.originalFilename || '',
            FILE_TYPE: file.mimetype || '',
          }).save();
          newFiles.push({ _id: saved._id, name: fieldName, ...saved.toObject() });
        }
      }
      res.end(JSON.stringify({ success: true, files: newFiles }));
    } catch (e) {
      logger.error(e.message);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

module.exports = uploadHandler;
