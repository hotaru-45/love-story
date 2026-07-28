const XLSX = require('xlsx');
const { DateTime } = require('luxon');
const auth = require('../auth');
const { SECRET, MANAGER_USER } = require('../../constants');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const { selects } = require('../utils/selectGraphql');
const graphqlFields = require('../utils/graphql-fields');
const { logSystemActivity } = require('../utils/systemLog');
const { getActor, isManager, assertCanManageUser, sanitizeUserMutationArgs } = require('../utils/permission');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { Users, UploadFiles, Stores, LogLogin } = require('../../models');

const ROLE_LABELS = { MANAGER: 'Manager', STAFF: 'Staff' };
const STATUS_LABELS = { 0: 'Online', 1: 'Offline', 2: 'Suspended' };

const EMPLOYEE_CHANGE_EXCLUDED_FIELDS = new Set(['_id', 'password', 'old_password', 'client_secret']);

function employeeEntityLabel(user) {
    return `Employee ID: ${user.code || user._id}`;
}

function buildEmployeeChanges(args, previous, updated) {
    const keys = Object.keys(args).filter((key) => !EMPLOYEE_CHANGE_EXCLUDED_FIELDS.has(key));
    if (keys.length === 0) return null;

    if (!previous) {
        const after = {};
        for (const key of keys) after[key] = updated[key];
        return { before: null, after };
    }

    const before = {};
    const after = {};
    for (const key of keys) {
        before[key] = previous[key];
        after[key] = updated[key];
    }
    return { before, after };
}

const EXPORT_COLUMNS = [
    { header: 'Full Name', key: 'full_name', width: 24 },
    { header: 'Username', key: 'username', width: 18 },
    { header: 'Email', key: 'mail', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Branch', key: 'branch', width: 22 },
    { header: 'Role', key: 'role', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Last Active', key: 'last_active', width: 20 },
];

async function buildUsersExportWorkbook(users) {
    const rows = users.map((user) => ({
        full_name: user.full_name || '',
        username: user.username || '',
        mail: user.mail || '',
        phone: user.phone || '',
        branch: user.STORE?.name_store || '—',
        role: ROLE_LABELS[user.permission] || user.permission || '',
        status: STATUS_LABELS[user.status] ?? '',
        last_active: user.LAST_ACTIVE ? DateTime.fromJSDate(new Date(user.LAST_ACTIVE)).toFormat('yyyy-LL-dd HH:mm') : 'Never',
    }));

    const sheet = XLSX.utils.json_to_sheet(rows, {
        header: EXPORT_COLUMNS.map((column) => column.key),
    });
    XLSX.utils.sheet_add_aoa(sheet, [EXPORT_COLUMNS.map((column) => column.header)], { origin: 'A1' });
    sheet['!cols'] = EXPORT_COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Employees');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

async function attachStoresAndLastActive(users, context) {
    const storeIds = [...new Set(users.map((user) => user.store_id).filter(Boolean))];
    const usernames = [...new Set(users.map((user) => user.username).filter(Boolean))];

    const [stores, lastLogins] = await Promise.all([
        storeIds.length
            ? Stores(context.tenant)
                .find({ _id: { $in: storeIds } })
                .lean()
            : [],
        usernames.length
            ? LogLogin(context.tenant).aggregate([
                { $match: { username: { $in: usernames }, acess_token: '[REDACTED]' } },
                { $sort: { created_at: -1 } },
                { $group: { _id: '$username', created_at: { $first: '$created_at' } } },
            ])
            : [],
    ]);

    const storeById = new Map(stores.map((store) => [String(store._id), store]));
    const lastActiveByUsername = new Map(lastLogins.map((login) => [login._id, login.created_at]));

    for (const user of users) {
        user.STORE = user.store_id ? storeById.get(String(user.store_id)) || null : null;
        user.LAST_ACTIVE = lastActiveByUsername.get(user.username) || null;
    }
}

const resolvers = {
    Query: {
        Users: async (parent, args, context, info) => {
            const result = await selects({
                model: Users(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    is_super_admin: { $ne: true },
                    ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
                },
            });

            const requestedFields = info ? graphqlFields(info)?.data || {} : {};
            if (requestedFields.STORE || requestedFields.LAST_ACTIVE) {
                await attachStoresAndLastActive(result.data, context);
            }

            return result;
        },
        User: async (parent, args, context) => {
            const userId = args._id || context.payload?.data?._id;
            const data = await Users(context.tenant).findById(userId).lean();
            if (data && !data.is_delete) {
                return data;
            }
            throw new Error('Get data failed!!!');
        },
        Users_stats: async (parent, args, context) => {
            const UsersModel = Users(context.tenant);
            const baseMatch = {
                is_delete: { $ne: true },
                is_super_admin: { $ne: true },
                ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
            };

            const [total, online, managers, suspended] = await Promise.all([
                UsersModel.countDocuments(baseMatch),
                UsersModel.countDocuments({ ...baseMatch, status: 0 }),
                UsersModel.countDocuments({ ...baseMatch, permission: 'MANAGER' }),
                UsersModel.countDocuments({ ...baseMatch, status: 2 }),
            ]);

            return { total, online, managers, suspended };
        },
        Users_export: async (parent, args, context) => {
            const result = await selects({
                model: Users(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    is_super_admin: { $ne: true },
                    ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
                },
                unlimited: true,
            });

            await attachStoresAndLastActive(result.data, context);

            const buffer = await buildUsersExportWorkbook(result.data);
            return {
                filename: `employees-${DateTime.now().toFormat('yyyy-LL-dd')}.xlsx`,
                base64: buffer.toString('base64'),
            };
        },
    },

    User: {
        FILE_AVATAR: async (parent, args, context) => {
            if (!parent?.avatar) return null;
            const data = await UploadFiles(context.tenant).findById(parent.avatar).lean();
            return data || null;
        },
        STORE: async (parent, args, context) => {
            if (parent.STORE !== undefined) return parent.STORE;
            if (!parent?.store_id) return null;
            const data = await Stores(context.tenant).findById(parent.store_id).lean();
            return data || null;
        },
        LAST_ACTIVE: async (parent, args, context) => {
            if (parent.LAST_ACTIVE !== undefined) return parent.LAST_ACTIVE;
            if (!parent?.username) return null;
            const data = await LogLogin(context.tenant).findOne({ username: parent.username, acess_token: '[REDACTED]' }).sort({ created_at: -1 }).lean();
            return data?.created_at || null;
        },
    },

    Mutation: {
        User_create: async (parent, args, context) => {
            const startedAt = Date.now();
            const actor = getActor(context);
            sanitizeUserMutationArgs(actor, args);
            if (isManager(actor)) {
                if (!actor.store_id) throw new Error('permission_denied');
                args.store_id = actor.store_id;
                args.permission = 'STAFF';
            }

            const existing = await Users(context.tenant).findOne({ username: args.username }).lean();

            if (existing) {
                throw new Error('User already exists');
            }

            if (args.password) {
                args.password = await hashPassword(args.password, SECRET.SECRET_PASS + context.tenant);
            }

            const UsersModel = Users(context.tenant);
            const data = new UsersModel(args);
            await data.save();

            const created = data.toObject();
            await logSystemActivity(context, {
                action: 'created',
                module: 'Employees',
                details: 'Created new employee',
                entity: employeeEntityLabel(created),
                changes: buildEmployeeChanges(args, null, created),
                resolverName: 'User_create',
                startedAt,
            });

            return data;
        },

        User_self_update: async (parent, args, context) => {
            const _id = context.payload?.data?._id;
            const user = await Users(context.tenant).findById(_id).lean();

            if (!user) {
                throw new Error('User not found');
            }

            if (args.password) {
                if (!args.old_password) {
                    throw new Error('error_user_105');
                }
                const pepper = SECRET.SECRET_PASS + context.tenant;
                if (!(await verifyPassword(args.old_password, user.password, pepper))) {
                    throw new Error('error_user_104');
                }
                if (await verifyPassword(args.password, user.password, pepper)) {
                    throw new Error('error_user_102');
                }
                args.password = await hashPassword(args.password, pepper);
            }
            delete args.old_password;

            const result = await Users(context.tenant).findByIdAndUpdate(_id, args, { returnDocument: 'after' }).lean();

            if (!result) throw new Error('Update failed');
            return result;
        },
        Admin_update_user: async (parent, args, context) => {
            const startedAt = Date.now();
            const actor = getActor(context);

            const previous = await Users(context.tenant).findById(args._id).lean();
            if (!previous) throw new Error('Update failed');
            assertCanManageUser(actor, previous);
            sanitizeUserMutationArgs(actor, args);

            if (args.password) {
                args.password = await hashPassword(args.password, SECRET.SECRET_PASS + context.tenant);
            }

            const result = await Users(context.tenant).findByIdAndUpdate(args._id, args, { returnDocument: 'after' }).lean();
            if (!result) throw new Error('Update failed');

            await logSystemActivity(context, {
                action: 'updated',
                module: 'Employees',
                details: 'Updated employee information',
                entity: employeeEntityLabel(result),
                changes: buildEmployeeChanges(args, previous, result),
                resolverName: 'Admin_update_user',
                startedAt,
            });

            return result;
        },

        User_delete: async (parent, args, context) => {
            const actor = getActor(context);
            const target = await Users(context.tenant).findById(args._id).lean();
            if (!target) throw new Error('Delete failed');
            assertCanManageUser(actor, target);

            const result = await Users(context.tenant).findByIdAndUpdate(args._id, { is_delete: true }, { new: true }).lean();

            if (!result) throw new Error('Delete failed');

            await logSystemActivity(context, {
                action: 'deleted',
                module: 'Employees',
                details: 'Deleted employee',
                entity: employeeEntityLabel(result),
                changes: { before: { is_delete: false }, after: { is_delete: true } },
                resolverName: 'User_delete',
                startedAt,
            });

            return true;
        },
    },
};

const resolversComposition = {
    'Query.Users': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.User': [auth.check_tenant(), auth.authentication()],
    'Query.Users_export': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Users_stats': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Mutation.User_create': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
    'Mutation.User_self_update': [auth.check_tenant(), auth.authentication()],
    'Mutation.Admin_update_user': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
    'Mutation.User_delete': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
};

module.exports = composeResolvers(resolvers, resolversComposition);
