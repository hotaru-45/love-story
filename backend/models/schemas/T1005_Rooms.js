var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: '',
      description: 'mã phòng',
    },
    name: {
      type: String,
      default: '',
      description: 'tên phòng',
    },
    store_id: {
      type: String,
      default: '',
      description: 'id chi nhánh',
    },
    type: {
      type: String,
      enum: ['Group', 'Private', 'Broadcast'],
      default: 'Group',
      description: 'loại phòng',
    },
    max_members: {
      type: Number,
      default: null,
      description: 'số thành viên tối đa (null = không giới hạn)',
    },
    current_members: {
      type: Number,
      default: 0,
      description: 'số thành viên hiện tại',
    },
    status: {
      type: String,
      enum: ['Live', 'Available', 'Offline'],
      default: 'Available',
      description: 'trạng thái phòng',
    },
    session_name: {
      type: String,
      default: '',
      description: 'tên phiên gọi hiện tại',
    },
    session_started_at: {
      type: Date,
      default: null,
      description: 'thời điểm bắt đầu phiên gọi hiện tại',
    },
    hashtag_ids: {
      type: [String],
      default: [],
      description: 'danh sách ID hashtag yêu cầu để vào room (rỗng = public)',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá phòng',
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
schema.index({ store_id: 1, is_delete: 1 });
schema.set('description', 'Phòng gọi thoại');

module.exports = schema;
