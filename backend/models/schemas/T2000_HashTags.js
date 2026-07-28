var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      description: 'tên hashtag',
    },
    code: {
      type: String,
      default: '',
      description: 'mã hashtag (auto-generated, unique)',
    },
    color: {
      type: String,
      default: '#7C3AED',
      description: 'màu hiển thị trên UI',
    },
    description: {
      type: String,
      default: '',
      description: 'mô tả mục đích tag',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá hashtag',
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
schema.index({ code: 1 }, { unique: true, sparse: true });
schema.set('description', 'HashTag phân quyền truy cập');

module.exports = schema;
