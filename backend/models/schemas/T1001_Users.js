var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        code: {
            type: String,
            default: '',
            description: 'mã người dùng',
        },
        username: {
            type: String,
            default: '',
            description: 'tài khoản người dùng',
        },
        password: {
            type: String,
            default: '',
            description: 'mật khẩu người dùng',
        },
        old_password: {
            type: [String],
            description: 'mật khẩu cũ của người dùng',
        },
        full_name: {
            type: String,
            default: '',
            description: 'họ tên người dùng',
        },
        mail: {
            type: String,
            default: '',
            description: 'mail người dùng',
        },
        phone: {
            type: mongoose.Schema.Types.Mixed,
            default: '',
            description: 'phone người dùng',
        },
        avatar: {
            type: String,
            default: '',
            description: 'ảnh đại diện',
        },
        infor: {
            type: Object,
            description: 'Thông tin người dùng',
        },
        store_id: {
            type: String,
            default: '',
            description: 'id cửa hàng',
        },
        id_role: {
            type: String,
            default: '',
            description: 'id role',
        },
        permission: {
            type: String,
            enum: ['ADMIN', 'MANAGER', 'STAFF'],
            default: 'STAFF',
            description: 'phân quyền người dùng',
        },
        is_super_admin: {
            type: Boolean,
            default: false,
            description: 'người dùng có quyền cao nhất (duy nhất 1 tài khoản)',
        },
        is_delete: {
            type: Boolean,
            default: false,
            description: 'xoá người dùng',
        },
        is_display: {
            type: Boolean,
            default: false,
            description: 'khoá người dùng',
        },
        status: {
            type: Number,
            enum: [0, 1, 2],
            default: 0,
            description: 'trạng thái người dùng (0=Online, 1=Offline, 2=Suspended)',
        },
        rooms: {
            type: Number,
            default: 0,
            description: 'số phòng được chỉ định',
        },
        hashtag_ids: {
            type: [String],
            default: [],
            description: 'danh sách ID hashtag được gắn cho user',
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    { versionKey: false }
);

schema.index({ store_id: 1, is_delete: 1 });

schema.set('description', 'Thông tin USER');

module.exports = schema;
