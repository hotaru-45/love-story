const auth = require('../auth');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { StoryChapters, GalleryPhotos, ChatMessages } = require('../../models');
const { getOrCreateSettings } = require('../utils/loveStorySettings');

const resolvers = {
    Query: {
        // Query cha chỉ là điểm neo — mỗi field con tự query theo context.tenant.
        LoveStory_page: async () => ({}),
    },

    LoveStoryPage: {
        settings: (parent, args, context) => getOrCreateSettings(context.tenant),
        stories: (parent, args, context) =>
            StoryChapters(context.tenant).find({ is_delete: { $ne: true } }).sort({ sort_order: 1 }).lean(),
        gallery: (parent, args, context) =>
            GalleryPhotos(context.tenant).find({ is_delete: { $ne: true } }).sort({ sort_order: 1 }).lean(),
        chat: (parent, args, context) =>
            ChatMessages(context.tenant).find({ is_delete: { $ne: true } }).sort({ sort_order: 1 }).lean(),
    },
};

const resolversComposition = {
    'Query.LoveStory_page': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
