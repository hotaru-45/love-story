const auth = require('../auth');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { ChatMessages } = require('../../models');

async function nextSortOrder(tenant) {
    const last = await ChatMessages(tenant).findOne({ is_delete: { $ne: true } }).sort({ sort_order: -1 }).lean();
    return (last?.sort_order ?? -1) + 1;
}

const resolvers = {
    Query: {
        Chat_messages: async (parent, args, context) => {
            return ChatMessages(context.tenant)
                .find({ is_delete: { $ne: true } })
                .sort({ sort_order: 1 })
                .lean();
        },
    },

    Mutation: {
        ChatMessage_create: async (parent, args, context) => {
            const Model = ChatMessages(context.tenant);
            const sort_order = args.sort_order ?? (await nextSortOrder(context.tenant));
            const data = new Model({ ...args, sort_order });
            await data.save();
            return data.toObject();
        },

        ChatMessage_update: async (parent, args, context) => {
            const result = await ChatMessages(context.tenant)
                .findByIdAndUpdate(args._id, args, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Update failed');
            return result;
        },

        ChatMessage_delete: async (parent, args, context) => {
            const result = await ChatMessages(context.tenant)
                .findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Delete failed');
            return true;
        },
    },
};

const resolversComposition = {
    'Query.Chat_messages': [auth.check_tenant(), auth.authentication()],
    'Mutation.ChatMessage_create': [auth.check_tenant(), auth.authentication()],
    'Mutation.ChatMessage_update': [auth.check_tenant(), auth.authentication()],
    'Mutation.ChatMessage_delete': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
