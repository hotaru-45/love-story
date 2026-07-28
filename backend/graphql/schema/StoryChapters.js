const auth = require('../auth');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { StoryChapters } = require('../../models');
const { resolveUploadFile } = require('../utils/resolveUploadFile');

async function nextSortOrder(tenant) {
    const last = await StoryChapters(tenant).findOne({ is_delete: { $ne: true } }).sort({ sort_order: -1 }).lean();
    return (last?.sort_order ?? -1) + 1;
}

const resolvers = {
    Query: {
        Story_chapters: async (parent, args, context) => {
            return StoryChapters(context.tenant)
                .find({ is_delete: { $ne: true } })
                .sort({ sort_order: 1 })
                .lean();
        },
    },

    Mutation: {
        StoryChapter_create: async (parent, args, context) => {
            const Model = StoryChapters(context.tenant);
            const sort_order = args.sort_order ?? (await nextSortOrder(context.tenant));
            const data = new Model({ ...args, sort_order });
            await data.save();
            return data.toObject();
        },

        StoryChapter_update: async (parent, args, context) => {
            const Model = StoryChapters(context.tenant);
            const result = await Model.findByIdAndUpdate(args._id, args, { returnDocument: 'after' }).lean();
            if (!result) throw new Error('Update failed');
            return result;
        },

        StoryChapter_delete: async (parent, args, context) => {
            const result = await StoryChapters(context.tenant)
                .findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Delete failed');
            return true;
        },
    },

    StoryChapter: {
        FILE_IMAGE: (parent, args, context) => resolveUploadFile(context.tenant, parent.image),
    },
};

const resolversComposition = {
    'Query.Story_chapters': [auth.check_tenant(), auth.authentication()],
    'Mutation.StoryChapter_create': [auth.check_tenant(), auth.authentication()],
    'Mutation.StoryChapter_update': [auth.check_tenant(), auth.authentication()],
    'Mutation.StoryChapter_delete': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
