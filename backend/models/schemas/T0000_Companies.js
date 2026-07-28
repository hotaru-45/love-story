var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        id_tenant: {
            type: String,
            required: true,
            unique: true,
            index: true,
            description: 'UUID định danh tenant, tự sinh khi tạo',
        },
        code_company: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            description: 'mã công ty, tối thiểu 5 ký tự A-Z 0-9',
        },
        name_company: {
            type: String,
            default: '',
            description: 'tên công ty',
        },
        address: {
            type: String,
            default: '',
            description: 'địa chỉ',
        },
        phone_number: {
            type: String,
            default: '',
            description: 'số điện thoại',
        },
        tax_code: {
            type: String,
            default: '',
            description: 'mã số thuế',
        },
        note: {
            type: String,
            default: '',
            description: 'ghi chú',
        },
        is_delete: {
            type: Boolean,
            default: false,
        },
        // --- Cài đặt bảo mật ---
        password_expire: {
            type: Number,
            default: 0,
            description: 'số ngày hết hạn mật khẩu (0 = không hết hạn)',
        },
        max_login: {
            type: Number,
            default: 0,
            description: 'số lần đăng nhập sai tối đa trước khi bị khoá (0 = không giới hạn)',
        },
        lockout_time: {
            type: Number,
            default: 5,
            description: 'thời gian khoá tài khoản sau khi sai quá số lần cho phép (phút)',
        },
        is_complex_password: {
            type: Boolean,
            default: false,
            description: 'yêu cầu mật khẩu phức tạp (chữ hoa, chữ thường, số, ký tự đặc biệt)',
        },
        password_length: {
            type: Number,
            default: 5,
            description: 'độ dài tối thiểu của mật khẩu',
        },
        password_old: {
            type: Number,
            default: 0,
            description: 'số lượng mật khẩu cũ không được dùng lại (0 = không giới hạn)',
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
schema.set('description', 'Công ty / Tenant');

module.exports = schema;
