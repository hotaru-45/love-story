var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    FILE: {
      type: String,
      default: '',
      description: 'đường dẫn file',
    },
    FILE_NAME: {
      type: String,
      default: '',
      description: 'tên file gốc',
    },
    FILE_TYPE: {
      type: String,
      default: '',
      description: 'mime type',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá file',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  }
);
schema.set('description', 'File đính kèm');

module.exports = schema;
