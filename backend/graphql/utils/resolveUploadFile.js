const { UploadFiles } = require('../../models');

// Trả về UploadFiles doc { _id, FILE, FILE_NAME, FILE_TYPE } từ 1 id lưu trong field kiểu avatar/image/src.
async function resolveUploadFile(tenant, fileId) {
  if (!fileId) return null;
  return UploadFiles(tenant).findById(fileId).lean();
}

module.exports = { resolveUploadFile };
