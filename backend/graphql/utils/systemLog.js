const { randomUUID } = require('crypto');
const { SystemLogs } = require('../../models');
const logger = require('../../logger');

async function logSystemActivity(context, { action, module, details, entity, status = 'success', changes = null, resolverName, startedAt, actor: actorOverride }) {
    try {
        const actor = actorOverride || context?.payload?.data || {};
        const SystemLogsModel = SystemLogs(context.tenant);

        const log = new SystemLogsModel({
            user_id: actor._id ? String(actor._id) : '',
            user_name: actor.full_name || actor.username || 'System',
            user_role: actor.is_super_admin ? 'ADMIN' : actor.permission || '',
            user_email: actor.mail || '',
            action,
            module,
            details,
            entity,
            ip: context?.remoteAddress || '',
            status,
            request_method: 'POST',
            request_endpoint: `graphql:${resolverName}`,
            request_user_agent: context?.reqHeaders?.['user-agent'] || '',
            changes,
            metadata: {
                request_id: randomUUID(),
                duration_ms: typeof startedAt === 'number' ? Date.now() - startedAt : null,
            },
        });
        await log.save();
    } catch (error) {
        logger.error('logSystemActivity error: ' + (error?.stack || error?.message || error));
    }
}

module.exports = { logSystemActivity };
