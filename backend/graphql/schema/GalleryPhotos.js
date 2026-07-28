const auth = require('../auth');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { GalleryPhotos } = require('../../models');
const { resolveUploadFile } = require('../utils/resolveUploadFile');

async function nextSortOrder(tenant) {
    const last = await GalleryPhotos(tenant).findOne({ is_delete: { $ne: true } }).sort({ sort_order: -1 }).lean();
    return (last?.sort_order ?? -1) + 1;
}

const resolvers = {
    Query: {
        Gallery_photos: async (parent, args, context) => {
            return GalleryPhotos(context.tenant)
                .find({ is_delete: { $ne: true } })
                .sort({ sort_order: 1 })
                .lean();
        },
    },

    Mutation: {
        GalleryPhoto_create: async (parent, args, context) => {
            const Model = GalleryPhotos(context.tenant);
            const sort_order = args.sort_order ?? (await nextSortOrder(context.tenant));
            const data = new Model({ ...args, sort_order });
            await data.save();
            return data.toObject();
        },

        GalleryPhoto_update: async (parent, args, context) => {
            const result = await GalleryPhotos(context.tenant)
                .findByIdAndUpdate(args._id, args, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Update failed');
            return result;
        },

        GalleryPhoto_delete: async (parent, args, context) => {
            const result = await GalleryPhotos(context.tenant)
                .findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' })
                .lean();
            if (!result) throw new Error('Delete failed');
            return true;
        },
    },

    GalleryPhoto: {
        FILE_SRC: (parent, args, context) => resolveUploadFile(context.tenant, parent.src),
    },
};

const resolversComposition = {
    'Query.Gallery_photos': [auth.check_tenant(), auth.authentication()],
    'Mutation.GalleryPhoto_create': [auth.check_tenant(), auth.authentication()],
    'Mutation.GalleryPhoto_update': [auth.check_tenant(), auth.authentication()],
    'Mutation.GalleryPhoto_delete': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
