var mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    couple_person1: {
      type: String,
      default: '',
      description: 'tên người 1',
    },
    couple_person2: {
      type: String,
      default: '',
      description: 'tên người 2',
    },
    start_date: {
      type: String,
      default: '',
      description: 'ngày bắt đầu yêu nhau (ISO)',
    },
    tagline: {
      type: [String],
      default: [],
      description: 'câu tagline hiển thị ở HomeIntro',
    },
    anniversary_password: {
      type: String,
      default: '',
      description: 'ngày kỷ niệm dùng làm mật khẩu cổng vào (DD/MM/YYYY)',
    },
    secret_code: {
      type: String,
      default: '',
      description: 'mã bí mật để mở chapter khoá',
    },
    hero_background: {
      type: String,
      default: '',
      description: 'UploadFiles _id ảnh nền đầu hành trình',
    },
    final_background: {
      type: String,
      default: '',
      description: 'UploadFiles _id ảnh nền cuối hành trình',
    },
    love_quotes: {
      type: [String],
      default: [],
      description: 'danh sách câu quote tình yêu',
    },
    final_letter_intro: {
      type: [String],
      default: [],
      description: 'đoạn mở đầu lá thư cuối',
    },
    final_letter_title: {
      type: String,
      default: '',
      description: 'tiêu đề lá thư cuối',
    },
    final_letter_paragraphs: {
      type: [String],
      default: [],
      description: 'các đoạn văn lá thư cuối',
    },
    final_letter_signature: {
      type: String,
      default: '',
      description: 'chữ ký lá thư cuối',
    },
    footer_made_by: {
      type: String,
      default: '',
      description: 'tên hiển thị ở footer',
    },
    music_src: {
      type: String,
      default: '',
      description: 'đường dẫn nhạc nền',
    },
    track_title: {
      type: String,
      default: '',
      description: 'tên bài hát hiển thị',
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
schema.set('description', 'Cấu hình chung của website Love Story (document đơn - singleton)');

module.exports = schema;
