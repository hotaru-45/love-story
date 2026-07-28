var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      default: '',
      description: 'id người thực hiện hành động',
    },
    user_name: {
      type: String,
      default: '',
      description: 'tên người thực hiện tại thời điểm ghi log',
    },
    user_role: {
      type: String,
      default: '',
      description: 'vai trò người thực hiện tại thời điểm ghi log',
    },
    user_email: {
      type: String,
      default: '',
      description: 'email người thực hiện tại thời điểm ghi log',
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'login', 'logout'],
      required: true,
      description: 'loại hành động',
    },
    module: {
      type: String,
      enum: ['Employees', 'Rooms', 'Authentication', 'Settings'],
      required: true,
      description: 'module liên quan',
    },
    details: {
      type: String,
      default: '',
      description: 'mô tả ngắn hành động',
    },
    entity: {
      type: String,
      default: '',
      description: 'đối tượng bị tác động',
    },
    ip: {
      type: String,
      default: '',
      description: 'địa chỉ IP của người thực hiện',
    },
    status: {
      type: String,
      enum: ['success', 'warning', 'failed', 'pending'],
      default: 'success',
      description: 'kết quả của hành động',
    },
    request_method: {
      type: String,
      default: '',
    },
    request_endpoint: {
      type: String,
      default: '',
    },
    request_user_agent: {
      type: String,
      default: '',
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      description: 'dữ liệu trước/sau khi thay đổi { before, after }',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      description: 'thông tin bổ sung { request_id, duration_ms }',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
    versionKey: false,
  }
);
schema.index({ created_at: -1 });
schema.index({ module: 1, action: 1 });
schema.index({ user_id: 1 });
schema.set('description', 'Nhật ký hoạt động hệ thống dùng cho trang Reports');

module.exports = schema;
