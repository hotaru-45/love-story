const auth = require('../auth');
const { SECRET_MASTER } = require('../../constants');
const { hashPassword } = require('../utils/passwordHash');
const { selects } = require('../utils/selectGraphql');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { UserMasters } = require('../../models');

const resolvers = {
    Query: {
        UserMasters: async (parent, args, context) => {
            const _user = context.payload.data;
            return selects({
                model: UserMasters(),
                args,
                find_required: {
                    _id: { $ne: _user?._id },
                    is_delete: { $ne: true },
                },
            });
        },
        UserMaster: async (parent, args, context) => {
            const data = await UserMasters().findById(args?._id).lean();
            if (data) {
                return data;
            }
            throw new Error('Error get data.');
        },
    },

    Mutation: {
        UserMaster_create: async (parent, args, context) => {
            const user = await UserMasters()
                .findOne({ username: args.username })
                .lean();

            if (user !== null) {
                throw new Error('User already exists');
            }

            if (args.password) {
                args.password = await hashPassword(args.password, SECRET_MASTER.SECRET_PASS);
            }
            if (!args.full_name) {
                args.full_name = args.username;
            }

            const UserMastersModel = UserMasters();
            const data = new UserMastersModel(args);
            await data.save();
            return data;
        },

        UserMaster_update: async (parent, args, context) => {
            if (args.password) {
                args.password = await hashPassword(args.password, SECRET_MASTER.SECRET_PASS);
            }
            const result = await UserMasters()
                .findByIdAndUpdate(args._id, { ...args }, { returnDocument: 'after' })
                .lean();
            return result;
        },

        UserMaster_delete: async (parent, args, context) => {
            const result = await UserMasters()
                .updateMany({ _id: { $in: args.list_id } }, { is_delete: true })
                .lean();
            return result.acknowledged === true;
        },
    },
};

const resolversComposition = {
    'Query.*': [auth.authentication_master()],
    'Mutation.*': [auth.authentication_master()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
