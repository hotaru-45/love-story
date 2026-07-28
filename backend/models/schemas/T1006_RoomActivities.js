var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    room_id: {
      type: String,
      default: '',
      description: 'id phòng liên quan',
    },
    room_name: {
      type: String,
      default: '',
      description: 'tên phòng tại thời điểm ghi log',
    },
    store_id: {
      type: String,
      default: '',
      description: 'id chi nhánh của phòng tại thời điểm ghi log',
    },
    type: {
      type: String,
      enum: ['created', 'updated', 'ended', 'members', 'type-changed', 'deleted'],
      default: 'updated',
      description: 'loại hoạt động',
    },
    title: {
      type: String,
      default: '',
      description: 'tiêu đề hoạt động',
    },
    description: {
      type: String,
      default: '',
      description: 'mô tả chi tiết hoạt động',
    },
    actor_name: {
      type: String,
      default: '',
      description: 'người thực hiện',
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
schema.set('description', 'Lịch sử hoạt động phòng gọi thoại');

module.exports = schema;
