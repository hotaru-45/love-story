var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['me', 'her'],
      default: 'me',
      description: 'người gửi tin nhắn',
    },
    text: {
      type: String,
      default: '',
      description: 'nội dung tin nhắn',
    },
    time: {
      type: String,
      default: '',
      description: 'thời gian hiển thị (vd 23:53)',
    },
    story_id: {
      type: String,
      default: '',
      description: 'id chương liên quan (StoryChapters), rỗng nếu không gắn',
    },
    sort_order: {
      type: Number,
      default: 0,
      description: 'thứ tự hiển thị',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá tin nhắn',
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
schema.set('description', 'Tin nhắn chat kỷ niệm hiển thị ở ChatReplay');

module.exports = schema;
