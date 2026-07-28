const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const auth = require('../auth');
const { Companies, Users, LogLogin } = require('../../models');
const { selects } = require('../utils/selectGraphql');
const { hashPassword } = require('../utils/passwordHash');
const { SECRET } = require('../../constants');
const { randomUUID } = require('crypto');

const resolvers = {
    Query: {
        Companies: async (parent, args, context) => {
            return selects({
                model: Companies(),
                args,
                find_required: { is_delete: { $ne: true } },
            });
        },
        Company: async (parent, args, context) => {
            const data = await Companies().findById(args._id).lean();
            if (!data) throw new Error('Company not found');
            return data;
        },
    },

    // Field resolvers below are only reachable through the master-authenticated
    // Companies/Company queries above, so they need no extra auth wrapper. They
    // query the company's own tenant DB via parent.id_tenant.
    Company: {
        user_stats: async (parent) => {
            const tenant = parent.id_tenant;
            if (!tenant) return null;
            const UsersModel = Users(tenant);
            const notDeleted = { is_delete: { $ne: true } };
            const [total, active, super_admin, lastLogin] = await Promise.all([
                UsersModel.countDocuments(notDeleted),
                UsersModel.countDocuments({ ...notDeleted, status: 1 }),
                UsersModel.countDocuments({ ...notDeleted, is_super_admin: true }),
                LogLogin(tenant)
                    .findOne({ acess_token: '[REDACTED]' })
                    .sort({ created_at: -1 })
                    .lean(),
            ]);
            return { total, active, super_admin, last_login: lastLogin?.created_at ?? null };
        },
        super_admins: async (parent) => {
            const tenant = parent.id_tenant;
            if (!tenant) return [];
            return Users(tenant)
                .find({ is_delete: { $ne: true }, is_super_admin: true })
                .select('_id username full_name status')
                .lean();
        },
    },

    Mutation: {
        Company_create: async (parent, args, context) => {
            const code = args.code_company?.toUpperCase();
            if (!code || !/^[A-Z0-9]{5,}$/.test(code)) {
                throw new Error('Mã công ty phải từ 5 ký tự trở lên, chỉ A-Z và 0-9');
            }

            const duplicate = await Companies().findOne({ code_company: code, is_delete: { $ne: true } }).lean();
            if (duplicate) throw new Error('Mã công ty đã tồn tại');

            const id_tenant = randomUUID();
            const CompaniesModel = Companies();
            const doc = new CompaniesModel({ ...args, code_company: code, id_tenant });
            await doc.save();

            // Tự động tạo user sadmin cho tenant mới
            const UsersModel = Users(id_tenant);
            const sadmin = new UsersModel({
                username: 'sadmin',
                password: await hashPassword('sadmin', SECRET.SECRET_PASS + id_tenant),
                full_name: 'Super Admin',
                permission: 'ADMIN',
                is_super_admin: true,
            });
            await sadmin.save();

            return doc;
        },
        Company_update: async (parent, args, context) => {
            const result = await Companies()
                .findByIdAndUpdate(args._id, args, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Company not found');
            return result;
        },
        Company_delete: async (parent, args, context) => {
            const result = await Companies()
                .findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' })
                .lean();
            return result !== null;
        },
        Company_reset_super_admin_password: async (parent, args, context) => {
            const { id_tenant, user_id, password } = args;

            const company = await Companies()
                .findOne({ id_tenant, is_delete: { $ne: true } })
                .lean();
            if (!company) throw new Error('Công ty không tồn tại');

            const minLength = company.password_length > 0 ? company.password_length : 1;
            if (!password || password.length < minLength) {
                throw new Error(`Mật khẩu phải từ ${minLength} ký tự trở lên`);
            }

            const target = await Users(id_tenant).findById(user_id).lean();
            if (!target || target.is_delete) throw new Error('Người dùng không tồn tại');
            if (!target.is_super_admin) throw new Error('Chỉ được đổi mật khẩu user super_admin');

            const hashed = await hashPassword(password, SECRET.SECRET_PASS + id_tenant);
            const result = await Users(id_tenant)
                .findByIdAndUpdate(user_id, { password: hashed }, { returnDocument: 'after' })
                .lean();
            return result !== null;
        },
    },
};

const resolversComposition = {
    'Query.*': [auth.authentication_master()],
    'Mutation.*': [auth.authentication_master()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
