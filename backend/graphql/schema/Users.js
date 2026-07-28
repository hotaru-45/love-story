const auth = require('../auth');
const { SECRET } = require('../../constants');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { Users, UploadFiles, LogLogin } = require('../../models');

const resolvers = {
    Query: {
        User: async (parent, args, context) => {
            const userId = args._id || context.payload?.data?._id;
            const data = await Users(context.tenant).findById(userId).lean();
            if (data && !data.is_delete) {
                return data;
            }
            throw new Error('Get data failed!!!');
        },
    },

    User: {
        FILE_AVATAR: async (parent, args, context) => {
            if (!parent?.avatar) return null;
            const data = await UploadFiles(context.tenant).findById(parent.avatar).lean();
            return data || null;
        },
        LAST_ACTIVE: async (parent, args, context) => {
            if (!parent?.username) return null;
            const data = await LogLogin(context.tenant).findOne({ username: parent.username, acess_token: '[REDACTED]' }).sort({ created_at: -1 }).lean();
            return data?.created_at || null;
        },
    },

    Mutation: {
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
    },
};

const resolversComposition = {
    'Query.User': [auth.check_tenant(), auth.authentication()],
    'Mutation.User_self_update': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
