const auth = require('../auth');
const { selects } = require('../utils/selectGraphql');
const { logSystemActivity } = require('../utils/systemLog');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { HashTags } = require('../../models');

async function nextHashTagCode(context) {
    const total = await HashTags(context.tenant).countDocuments({});
    return `TAG-${1001 + total}`;
}

const resolvers = {
    Query: {
        HashTags: async (parent, args, context) => {
            return selects({
                model: HashTags(context.tenant),
                args,
                find_required: { is_delete: { $ne: true } },
            });
        },
    },

    Mutation: {
        HashTag_create: async (parent, args, context) => {
            const HashTagsModel = HashTags(context.tenant);
            const code = args.code || await nextHashTagCode(context);
            const data = new HashTagsModel({ ...args, code });
            await data.save();

            if (data) return data;
            return null;
        },

        HashTag_update: async (parent, args, context) => {
            const previous = await HashTags(context.tenant).findById(args._id).lean();
            if (!previous) throw new Error('HashTag not found');

            const result = await HashTags(context.tenant)
                .findByIdAndUpdate(args._id, args, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Update failed');

            return result;
        },

        HashTag_delete: async (parent, args, context) => {
            const result = await HashTags(context.tenant)
                .findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('HashTag not found');
            return true;
        },
    },
};

const resolversComposition = {
    'Query.HashTags': [auth.check_tenant(), auth.authentication()],
    'Mutation.HashTag_create': [auth.check_tenant(), auth.authentication()],
    'Mutation.HashTag_update': [auth.check_tenant(), auth.authentication()],
    'Mutation.HashTag_delete': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
