const auth = require('../auth');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { LoveStorySettings } = require('../../models');
const { resolveUploadFile } = require('../utils/resolveUploadFile');
const { getOrCreateSettings } = require('../utils/loveStorySettings');

const resolvers = {
    Query: {
        LoveStory_settings: async (parent, args, context) => getOrCreateSettings(context.tenant),

        LoveStory_public_settings: async (parent, args, context) => getOrCreateSettings(context.tenant),
    },

    Mutation: {
        LoveStorySettings_update: async (parent, args, context) => {
            const Model = LoveStorySettings(context.tenant);
            const existing = await Model.findOne({}).lean();
            const updated = existing
                ? await Model.findByIdAndUpdate(existing._id, args, { returnDocument: 'after' }).lean()
                : (await new Model(args).save()).toObject();
            return updated;
        },
    },

    LoveStorySettings: {
        FILE_HERO_BACKGROUND: (parent, args, context) => resolveUploadFile(context.tenant, parent.hero_background),
        FILE_FINAL_BACKGROUND: (parent, args, context) => resolveUploadFile(context.tenant, parent.final_background),
    },

    LoveStoryPublicSettings: {
        FILE_HERO_BACKGROUND: (parent, args, context) => resolveUploadFile(context.tenant, parent.hero_background),
    },
};

const resolversComposition = {
    'Query.LoveStory_settings': [auth.check_tenant(), auth.authentication()],
    'Query.LoveStory_public_settings': [auth.check_company()],
    'Mutation.LoveStorySettings_update': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
