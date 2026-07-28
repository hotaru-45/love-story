var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: '',
      description: 'ngày diễn ra kỷ niệm (hiển thị dạng chuỗi)',
    },
    title: {
      type: String,
      default: '',
      description: 'tiêu đề chương',
    },
    content: {
      type: String,
      default: '',
      description: 'nội dung chương',
    },
    hidden_thought: {
      type: String,
      default: '',
      description: 'suy nghĩ ẩn, hiện khi bấm vào chương',
    },
    mood: {
      type: String,
      enum: ['happy', 'sad', 'funny', 'deep', 'love'],
      default: 'happy',
      description: 'tâm trạng của chương, quyết định theme màu',
    },
    image: {
      type: String,
      default: '',
      description: 'UploadFiles _id ảnh của chương',
    },
    has_voice_note: {
      type: Boolean,
      default: false,
      description: 'chương có ghi chú giọng nói không',
    },
    locked: {
      type: Boolean,
      default: false,
      description: 'chương chỉ mở khi người dùng unlock bằng secret_code',
    },
    sort_order: {
      type: Number,
      default: 0,
      description: 'thứ tự hiển thị',
    },
    is_delete: {
      type: Boolean,
      default: false,
      description: 'xoá chương',
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
schema.set('description', 'Chương kỷ niệm trong hành trình tình yêu');

module.exports = schema;
