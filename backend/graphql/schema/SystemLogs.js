const XLSX = require('xlsx');
const { DateTime } = require('luxon');
const auth = require('../auth');
const { selects } = require('../utils/selectGraphql');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { SystemLogs } = require('../../models');

const EXPORT_COLUMNS = [
    { header: 'Time', key: 'created_at', width: 20 },
    { header: 'User', key: 'user_name', width: 22 },
    { header: 'Action', key: 'action', width: 14 },
    { header: 'Module', key: 'module', width: 16 },
    { header: 'Details', key: 'details', width: 30 },
    { header: 'Entity', key: 'entity', width: 24 },
    { header: 'IP Address', key: 'ip', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
];

async function buildSystemLogsExportWorkbook(logs) {
    const rows = logs.map((log) => ({
        created_at: log.created_at ? DateTime.fromJSDate(new Date(log.created_at)).toFormat('yyyy-LL-dd HH:mm:ss') : '',
        user_name: log.user_name || '',
        action: log.action || '',
        module: log.module || '',
        details: log.details || '',
        entity: log.entity || '',
        ip: log.ip || '',
        status: log.status || '',
    }));

    const sheet = XLSX.utils.json_to_sheet(rows, {
        header: EXPORT_COLUMNS.map((column) => column.key),
    });
    XLSX.utils.sheet_add_aoa(sheet, [EXPORT_COLUMNS.map((column) => column.header)], { origin: 'A1' });
    sheet['!cols'] = EXPORT_COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Activity Logs');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function serializeLogDates(log) {
    if (!log) return log;
    log.created_at = log.created_at ? new Date(log.created_at).toISOString() : log.created_at;
    return log;
}

const resolvers = {
    Query: {
        System_logs: async (parent, args, context) => {
            const result = await selects({
                model: SystemLogs(context.tenant),
                args,
            });
            result.data = result.data.map(serializeLogDates);
            return result;
        },

        System_logs_stats: async (parent, args, context) => {
            const SystemLogsModel = SystemLogs(context.tenant);

            const [total, uniqueUsers, viewActions, createUpdateActions, deleteActions] = await Promise.all([
                SystemLogsModel.countDocuments({}),
                SystemLogsModel.distinct('user_id', { user_id: { $ne: '' } }),
                SystemLogsModel.countDocuments({ action: 'viewed' }),
                SystemLogsModel.countDocuments({ action: { $in: ['created', 'updated'] } }),
                SystemLogsModel.countDocuments({ action: 'deleted' }),
            ]);

            return {
                total,
                unique_users: uniqueUsers.length,
                view_actions: viewActions,
                create_update_actions: createUpdateActions,
                delete_actions: deleteActions,
            };
        },

        System_logs_export: async (parent, args, context) => {
            const result = await selects({
                model: SystemLogs(context.tenant),
                args,
                unlimited: true,
            });

            result.data = result.data.map(serializeLogDates);
            const buffer = await buildSystemLogsExportWorkbook(result.data);
            return {
                filename: `activity-logs-${DateTime.now().toFormat('yyyy-LL-dd')}.xlsx`,
                base64: buffer.toString('base64'),
            };
        },
    },
};

const resolversComposition = {
    'Query.System_logs': [auth.check_tenant(), auth.authentication()],
    'Query.System_logs_stats': [auth.check_tenant(), auth.authentication()],
    'Query.System_logs_export': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
