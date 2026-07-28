var mongoose = require('mongoose');
const { LRUCache } = require('lru-cache');
const logger = require('../logger');

module.exports = {
    isValidTenant,
    Users: (idTenant) => {
        return getModelByTenant(idTenant, 'users', require('./schemas/T1001_Users'));
    },
    LogAPI: (idTenant) => {
        return getModelByTenant(idTenant, 'logs-apis', require('./schemas/T0001_LogApis'));
    },
    LogLogin: (idTenant) => {
        return getModelByTenant(idTenant, 'logs-logins', require('./schemas/T0002_LogLogins'));
    },
    UserMasters: () => {
        return getModelByTenant('master', 'user-masters', require('./schemas/T0000_UserMasters'));
    },
    Companies: () => {
        return getModelByTenant('master', 'companies', require('./schemas/T0000_Companies'));
    },
    BlockLoginAccess: () => {
        return getModelByTenant('master', 'block-login-accesses', require('./schemas/T0000_BlockLoginAccess'));
    },
    RoleControl: (idTenant) => {
        return getModelByTenant(idTenant, 'role-controls', require('./schemas/T1002_RoleControl'));
    },
    UploadFiles: (idTenant) => {
        return getModelByTenant(idTenant, 'upload-files', require('./schemas/T1004_UploadFiles'));
    },
    SystemLogs: (idTenant) => {
        return getModelByTenant(idTenant, 'system-logs', require('./schemas/T1007_SystemLogs'));
    },
    LoveStorySettings: (idTenant) => {
        return getModelByTenant(idTenant, 'love-story-settings', require('./schemas/T2001_LoveStorySettings'));
    },
    StoryChapters: (idTenant) => {
        return getModelByTenant(idTenant, 'story-chapters', require('./schemas/T2002_StoryChapters'));
    },
    GalleryPhotos: (idTenant) => {
        return getModelByTenant(idTenant, 'gallery-photos', require('./schemas/T2003_GalleryPhotos'));
    },
    ChatMessages: (idTenant) => {
        return getModelByTenant(idTenant, 'chat-messages', require('./schemas/T2004_ChatMessages'));
    },
};

const mongoOption = {
    autoIndex: process.env.NODE_ENV !== 'production',
};

let baseConn = null;
const getBaseConnection = () => {
    if (baseConn) return baseConn;
    baseConn = mongoose.createConnection(process.env.MONGODB_DATA_URL, mongoOption);
    logger.info('mongo base connection NEW');
    baseConn.on('open', () => logger.info('mongo base connection OPEN'));
    baseConn.on('reconnected', () => logger.info('mongo base connection RECONNECTED'));
    baseConn.on('disconnected', () => logger.info('mongo base connection DISCONNECTED'));
    baseConn.on('close', () => logger.info('mongo base connection CLOSE'));
    baseConn.on('error', (err) => logger.error(err.stack ? err.stack : err.message));
    return baseConn;
};

const getModelByTenant = (tenantId, modelName, modelSchema) => {
    const dbName = `${process.env.NAME_APP}_${tenantId}`;
    const db = getBaseConnection().useDb(dbName, { useCache: true });
    return db.model(modelName, modelSchema);
};

const tenantValidCache = new LRUCache({ max: 5000, ttl: 5 * 60 * 1000 }); // 5 phút

async function isValidTenant(tenantId) {
    if (!tenantId || typeof tenantId !== 'string') return false;
    if (tenantId === 'master') return true;

    const cached = tenantValidCache.get(tenantId);
    if (cached !== undefined) return cached;

    let valid = false;
    try {
        const company = await module.exports
            .Companies()
            .findOne({ id_tenant: tenantId })
            .select('_id')
            .lean();
        valid = !!company;
    } catch (e) {
        logger.error('isValidTenant error: ' + (e?.message ?? e));
        return false;
    }
    tenantValidCache.set(tenantId, valid);
    return valid;
}
