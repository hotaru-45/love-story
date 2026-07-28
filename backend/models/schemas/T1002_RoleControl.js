var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      description: 'tên nhóm quyền',
    },
    is_admin: {
      type: Boolean,
      default: false,
      description: 'nhóm quyền admin (bỏ qua kiểm tra chi tiết)',
    },
    mode_sigin: {
      type: Number,
      default: 0,
      description: '0=tất cả thiết bị, 1=chỉ mobile, 2=chỉ desktop',
    },
    arr_role: {
      type: [
        {
          key: { type: String },
          type_control: {
            read: { type: Boolean, default: false },
            write: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
          },
          permission_read: { type: Number, default: 0 },
          permission: { type: Number, default: 0 },
          store_ids: {
            type: [String],
            default: [],
            description: 'danh sách store được chỉ định (dùng khi scope = STORES/1)',
          },
        },
      ],
      default: [],
      description: 'danh sách quyền chi tiết theo key',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá nhóm quyền',
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
schema.set('description', 'Nhóm quyền người dùng');

module.exports = schema;
