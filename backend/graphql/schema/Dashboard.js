const qs = require('qs');
const { DateTime } = require('luxon');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const auth = require('../auth');
const StoresResolvers = require('./Stores.js');
const RoomsResolvers = require('./Rooms.js');
const UsersResolvers = require('./Users.js');
const SystemLogsResolvers = require('./SystemLogs.js');

const TOP_BRANCHES = 5;
const USAGE_DAYS = 7;
const RECENT_ACTIVITY_LIMIT = 8;

const qsfind = (find) => qs.stringify(find, { encodeValuesOnly: true });

const buildTodayFind = () => qsfind({ created_at: { $gte: DateTime.now().startOf('day').toISO() } });
const buildRecentIssuesFind = () => qsfind({ status: { $in: ['failed', 'warning'] }, created_at: { $gte: DateTime.now().minus({ hours: 24 }).toISO() } });

async function countSystemLogs(context, find) {
    const result = await SystemLogsResolvers.Query.System_logs(null, { select: { find, limit: 1 } }, context);
    return result.total;
}

async function countUsersByRole(context, permission) {
    const result = await UsersResolvers.Query.Users(null, { select: { find: qsfind({ permission }), limit: 1 } }, context);
    return result.total;
}

const resolvers = {
    Query: {
        Dashboard_overview: async () => ({}),
    },

    DashboardOverview: {
        stores_stats: (parent, args, context) => StoresResolvers.Query.Stores_stats(parent, {}, context),
        rooms_stats: (parent, args, context) => RoomsResolvers.Query.Rooms_stats(parent, {}, context),
        today_activity_total: (parent, args, context) => countSystemLogs(context, buildTodayFind()),
        recent_issues_total: (parent, args, context) => countSystemLogs(context, buildRecentIssuesFind()),
        branches: (parent, args, context, info) => StoresResolvers.Query.Stores(parent, { select: { limit: TOP_BRANCHES, sort: 'name_store' } }, context, info),
        usage_daily: (parent, args, context) => RoomsResolvers.Query.Rooms_usage_daily(parent, { days: USAGE_DAYS }, context),
        manager_total: (parent, args, context) => countUsersByRole(context, 'MANAGER'),
        staff_total: (parent, args, context) => countUsersByRole(context, 'STAFF'),
        recent_activity: (parent, args, context) =>
            SystemLogsResolvers.Query.System_logs(parent, { select: { limit: RECENT_ACTIVITY_LIMIT, sort: '-created_at' } }, context),
    },
};

const resolversComposition = {
    'Query.Dashboard_overview': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
