var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    code_store: {
      type: String,
      default: '',
      description: 'mã cửa hàng',
    },
    name_store: {
      type: String,
      default: '',
      description: 'tên cửa hàng',
    },
    code_headquarter: {
      type: String,
      default: '',
      description: 'mã chi nhánh/trụ sở',
    },
    address: {
      type: String,
      default: '',
      description: 'địa chỉ cửa hàng',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá cửa hàng',
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
schema.set('description', 'Cửa hàng');

module.exports = schema;
