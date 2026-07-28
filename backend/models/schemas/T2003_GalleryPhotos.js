var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    src: {
      type: String,
      default: '',
      description: 'UploadFiles _id ảnh',
    },
    caption: {
      type: String,
      default: '',
      description: 'chú thích ảnh',
    },
    sort_order: {
      type: Number,
      default: 0,
      description: 'thứ tự hiển thị',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá ảnh',
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
schema.index({ sort_order: 1 });
schema.set('description', 'Ảnh kỷ niệm rời trong MemoryGallery');

module.exports = schema;
