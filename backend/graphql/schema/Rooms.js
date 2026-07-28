const XLSX = require('xlsx');
const { DateTime } = require('luxon');
const auth = require('../auth');
const { selects, toMapById } = require('../utils/selectGraphql');
const graphqlFields = require('../utils/graphql-fields');
const { logSystemActivity } = require('../utils/systemLog');
const { getActor, isAdmin, assertSameStoreOrAdmin } = require('../utils/permission');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { Rooms, RoomActivities, Stores, HashTags } = require('../../models');

const RECENT_ACTIVITIES_LIMIT = 8;
const LIVE_PREVIEW_LIMIT = 3;
const USAGE_DEFAULT_DAYS = 7;
const USAGE_MAX_DAYS = 30;
const ROOM_CHANGE_EXCLUDED_FIELDS = new Set(['_id']);

function roomEntityLabel(room) {
    return `Room ID: ${room.code || room._id}`;
}

function buildRoomChanges(args, previous, updated) {
    const keys = Object.keys(args).filter((key) => !ROOM_CHANGE_EXCLUDED_FIELDS.has(key));
    if (keys.length === 0) return null;

    if (!previous) {
        const after = {};
        for (const key of keys) after[key] = updated[key];
        return { before: null, after };
    }

    const before = {};
    const after = {};
    for (const key of keys) {
        before[key] = previous[key];
        after[key] = updated[key];
    }
    return { before, after };
}

const EXPORT_COLUMNS = [
    { header: 'Room Name', key: 'name', width: 26 },
    { header: 'Code', key: 'code', width: 16 },
    { header: 'Branch', key: 'branch', width: 24 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Max Members', key: 'max_members', width: 14 },
    { header: 'Current Members', key: 'current_members', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Session Name', key: 'session_name', width: 22 },
    { header: 'Created At', key: 'created_at', width: 20 },
];

async function buildRoomsExportWorkbook(rooms) {
    const rows = rooms.map((room) => ({
        name: room.name || '',
        code: room.code || '',
        branch: room.branch?.name_store || '—',
        type: room.type || '',
        max_members: room.type === 'Broadcast' ? 'Unlimited' : room.max_members || '',
        current_members: room.current_members || 0,
        status: room.status || '',
        session_name: room.session_name || '',
        created_at: room.created_at ? DateTime.fromISO(room.created_at).toFormat('yyyy-LL-dd HH:mm') : '',
    }));

    const sheet = XLSX.utils.json_to_sheet(rows, {
        header: EXPORT_COLUMNS.map((column) => column.key),
    });
    XLSX.utils.sheet_add_aoa(sheet, [EXPORT_COLUMNS.map((column) => column.header)], { origin: 'A1' });
    sheet['!cols'] = EXPORT_COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Rooms');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function toISOString(value) {
    return value ? new Date(value).toISOString() : value;
}

function serializeRoomDates(room) {
    if (!room) return room;
    room.created_at = toISOString(room.created_at);
    room.updated_at = toISOString(room.updated_at);
    room.session_started_at = toISOString(room.session_started_at);
    return room;
}

function serializeActivityDates(activity) {
    if (!activity) return activity;
    activity.created_at = toISOString(activity.created_at);
    return activity;
}

async function attachRoomBranch(rooms, context) {
    const storeIds = [...new Set(rooms.map((room) => room.store_id).filter(Boolean))];
    const stores = storeIds.length
        ? await Stores(context.tenant)
              .find({ _id: { $in: storeIds } })
              .select('name_store code_store')
              .lean()
        : [];
    const storeById = toMapById(stores);

    for (const room of rooms) {
        room.branch = room.store_id ? storeById.get(String(room.store_id)) || null : null;
    }
}

async function nextRoomCode(context) {
    const total = await Rooms(context.tenant).countDocuments({});
    return `ROOM-${1001 + total}`;
}

async function attachRoomHashtags(rooms, context) {
    const allTagIds = [...new Set(rooms.flatMap((room) => room.hashtag_ids || []).filter(Boolean))];
    if (allTagIds.length === 0) return;

    const tags = await HashTags(context.tenant)
        .find({ _id: { $in: allTagIds }, is_delete: { $ne: true } })
        .lean();
    const tagById = new Map(tags.map((tag) => [String(tag._id), tag]));

    for (const room of rooms) {
        room.hashtags = (room.hashtag_ids || []).map((id) => tagById.get(String(id))).filter(Boolean);
    }
}

async function fetchLiveRoomPreview(context, store_id) {
    const match = { is_delete: { $ne: true }, status: 'Live' };
    if (store_id) match.store_id = store_id;

    const rooms = await Rooms(context.tenant)
        .find(match)
        .select('name session_name current_members session_started_at')
        .sort({ updated_at: -1 })
        .limit(LIVE_PREVIEW_LIMIT)
        .lean();

    return rooms.map(serializeRoomDates);
}

async function logRoomActivity(context, { room, type, title, description }) {
    const RoomActivitiesModel = RoomActivities(context.tenant);
    const activity = new RoomActivitiesModel({
        room_id: String(room._id),
        room_name: room.name,
        store_id: room.store_id || '',
        type,
        title,
        description,
        actor_name: context.payload?.data?.full_name || context.payload?.data?.username || 'System',
    });
    await activity.save();
}

function buildUpdateActivity(room, previous) {
    if (previous.status !== room.status && (previous.status === 'Live' || room.status === 'Live')) {
        return room.status === 'Live'
            ? { type: 'updated', title: 'Room went live', description: `${room.name} status changed to Live` }
            : { type: 'ended', title: 'Room session ended', description: `${room.name} session ended` };
    }
    if (previous.type !== room.type) {
        return { type: 'type-changed', title: 'Room type changed', description: `${room.name} changed to ${room.type}` };
    }
    if (previous.current_members !== room.current_members) {
        return { type: 'members', title: 'Members updated', description: `${room.name} now has ${room.current_members} member(s)` };
    }
    return { type: 'updated', title: 'Room updated', description: `${room.name} settings updated` };
}

const resolvers = {
    Query: {
        Rooms: async (parent, args, context, info) => {
            const result = await selects({
                model: Rooms(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
                },
            });

            const requestedFields = graphqlFields(info)?.data || {};
            if (requestedFields.branch) {
                await attachRoomBranch(result.data, context);
            }
            if (requestedFields.hashtags) {
                await attachRoomHashtags(result.data, context);
            }
            result.data = result.data.map(serializeRoomDates);

            return result;
        },

        Rooms_stats: async (parent, args, context) => {
            const RoomsModel = Rooms(context.tenant);
            const baseMatch = { is_delete: { $ne: true } };
            // scope_store_id (nếu có) luôn thắng args.store_id để MANAGER/STAFF không xem chéo chi nhánh.
            const effectiveStoreId = context.scope_store_id || args.store_id;
            if (effectiveStoreId) baseMatch.store_id = effectiveStoreId;

            const [total, live, privateRooms, broadcastRooms, membersAgg] = await Promise.all([
                RoomsModel.countDocuments(baseMatch),
                RoomsModel.countDocuments({ ...baseMatch, status: 'Live' }),
                RoomsModel.countDocuments({ ...baseMatch, type: 'Private' }),
                RoomsModel.countDocuments({ ...baseMatch, type: 'Broadcast' }),
                RoomsModel.aggregate([{ $match: baseMatch }, { $group: { _id: null, average: { $avg: '$current_members' } } }]),
            ]);

            return {
                total,
                live,
                private_rooms: privateRooms,
                broadcast_rooms: broadcastRooms,
                average_members: Math.round((membersAgg[0]?.average || 0) * 10) / 10,
            };
        },

        Room_activities: async (parent, args, context) => {
            const limit = Math.min(Math.max(parseInt(args.limit, 10) || RECENT_ACTIVITIES_LIMIT, 1), 50);
            const effectiveStoreId = context.scope_store_id || args.store_id;
            const match = effectiveStoreId ? { store_id: effectiveStoreId } : {};
            const activities = await RoomActivities(context.tenant).find(match).sort({ created_at: -1 }).limit(limit).lean();
            return activities.map(serializeActivityDates);
        },

        Rooms_usage_daily: async (parent, args, context) => {
            const days = Math.min(Math.max(parseInt(args.days, 10) || USAGE_DEFAULT_DAYS, 1), USAGE_MAX_DAYS);
            const since = DateTime.utc()
                .minus({ days: days - 1 })
                .startOf('day');

            const rows = await RoomActivities(context.tenant).aggregate([
                {
                    $match: {
                        created_at: { $gte: since.toJSDate() },
                        ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
                    },
                },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, sessions: { $sum: 1 } } },
            ]);
            const countByDay = new Map(rows.map((row) => [row._id, row.sessions]));

            return Array.from({ length: days }, (_, index) => {
                const date = since.plus({ days: index });
                return { day: date.toFormat('LLL dd'), sessions: countByDay.get(date.toFormat('yyyy-LL-dd')) || 0 };
            });
        },

        Rooms_export: async (parent, args, context) => {
            const result = await selects({
                model: Rooms(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    ...(context.scope_store_id ? { store_id: context.scope_store_id } : {}),
                },
                unlimited: true,
            });

            await attachRoomBranch(result.data, context);
            result.data = result.data.map(serializeRoomDates);

            const buffer = await buildRoomsExportWorkbook(result.data);
            return {
                filename: `rooms-${DateTime.now().toFormat('yyyy-LL-dd')}.xlsx`,
                base64: buffer.toString('base64'),
            };
        },

        Room_side_panel: async (parent, args, context) => ({ store_id: context.scope_store_id || args.store_id }),
    },

    RoomSidePanel: {
        stats: (parent, args, context) => resolvers.Query.Rooms_stats(parent, { store_id: parent.store_id }, context),
        live_rooms: (parent, args, context) => fetchLiveRoomPreview(context, parent.store_id),
        activities: (parent, args, context) => resolvers.Query.Room_activities(parent, { limit: RECENT_ACTIVITIES_LIMIT, store_id: parent.store_id }, context),
    },

    Mutation: {
        Room_create: async (parent, args, context) => {
            const startedAt = Date.now();
            const actor = getActor(context);
            if (!isAdmin(actor)) {
                // MANAGER chưa được gán chi nhánh thì không tạo room được (fail-closed).
                if (!actor.store_id) throw new Error('permission_denied');
                args.store_id = actor.store_id; // MANAGER chỉ tạo room trong chi nhánh mình
            }
            const RoomsModel = Rooms(context.tenant);
            const code = await nextRoomCode(context);
            const session_started_at = args.status === 'Live' ? new Date() : null;
            const data = new RoomsModel({ ...args, code, session_started_at });
            await data.save();

            const room = data.toObject();
            await logRoomActivity(context, {
                room,
                type: 'created',
                title: 'New room created',
                description: `${room.name} by ${context.payload?.data?.full_name || context.payload?.data?.username || 'System'}`,
            });
            await logSystemActivity(context, {
                action: 'created',
                module: 'Rooms',
                details: 'Created new room',
                entity: roomEntityLabel(room),
                changes: buildRoomChanges({ ...args, code }, null, room),
                resolverName: 'Room_create',
                startedAt,
            });
            await attachRoomBranch([room], context);
            return serializeRoomDates(room);
        },

        Room_update: async (parent, args, context) => {
            const startedAt = Date.now();
            const actor = getActor(context);
            const RoomsModel = Rooms(context.tenant);
            const previous = await RoomsModel.findById(args._id).lean();
            if (!previous) throw new Error('Update failed');
            assertSameStoreOrAdmin(actor, previous.store_id);
            if (!isAdmin(actor)) delete args.store_id; // không cho chuyển room sang chi nhánh khác

            const update = { ...args };
            if (args.status === 'Live' && previous.status !== 'Live') {
                update.session_started_at = new Date();
            }

            const result = await RoomsModel.findByIdAndUpdate(args._id, update, { returnDocument: 'after' }).lean();
            if (!result) throw new Error('Update failed');

            await logRoomActivity(context, { room: result, ...buildUpdateActivity(result, previous) });
            await logSystemActivity(context, {
                action: 'updated',
                module: 'Rooms',
                details: 'Updated room settings',
                entity: roomEntityLabel(result),
                changes: buildRoomChanges(args, previous, result),
                resolverName: 'Room_update',
                startedAt,
            });
            await attachRoomBranch([result], context);
            return serializeRoomDates(result);
        },

        Room_delete: async (parent, args, context) => {
            const startedAt = Date.now();
            const actor = getActor(context);
            const target = await Rooms(context.tenant).findById(args._id).lean();
            if (!target) throw new Error('Delete failed');
            assertSameStoreOrAdmin(actor, target.store_id);

            const result = await Rooms(context.tenant).findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' }).lean();
            if (!result) throw new Error('Delete failed');

            await logRoomActivity(context, {
                room: result,
                type: 'deleted',
                title: 'Room deleted',
                description: `${result.name} was deleted`,
            });
            await logSystemActivity(context, {
                action: 'deleted',
                module: 'Rooms',
                details: 'Deleted room',
                entity: roomEntityLabel(result),
                changes: { before: { is_delete: false }, after: { is_delete: true } },
                resolverName: 'Room_delete',
                startedAt,
            });
            return true;
        },
    },
};

const resolversComposition = {
    'Query.Rooms': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Rooms_stats': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Room_activities': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Rooms_usage_daily': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Rooms_export': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Room_side_panel': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Mutation.Room_create': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
    'Mutation.Room_update': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
    'Mutation.Room_delete': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN', 'MANAGER'])],
};

module.exports = composeResolvers(resolvers, resolversComposition);
