const XLSX = require('xlsx');
const { DateTime } = require('luxon');
const auth = require('../auth');
const { selects, toMapById } = require('../utils/selectGraphql');
const graphqlFields = require('../utils/graphql-fields');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const { Stores, Users, Rooms } = require('../../models');

const TOP_BRANCHES = 5;

const EXPORT_COLUMNS = [
    { header: 'Branch Name', key: 'name_store', width: 26 },
    { header: 'Code', key: 'code_store', width: 16 },
    { header: 'Headquarter Code', key: 'code_headquarter', width: 20 },
    { header: 'Address', key: 'address', width: 32 },
    { header: 'Employees', key: 'employees_count', width: 14 },
    { header: 'Rooms', key: 'rooms_count', width: 14 },
];

async function buildStoresExportWorkbook(stores) {
    const rows = stores.map((store) => ({
        name_store: store.name_store || '',
        code_store: store.code_store || '',
        code_headquarter: store.code_headquarter || '',
        address: store.address || '',
        employees_count: store.employees_count || 0,
        rooms_count: store.rooms_count || 0,
    }));

    const sheet = XLSX.utils.json_to_sheet(rows, {
        header: EXPORT_COLUMNS.map((column) => column.key),
    });
    XLSX.utils.sheet_add_aoa(sheet, [EXPORT_COLUMNS.map((column) => column.header)], { origin: 'A1' });
    sheet['!cols'] = EXPORT_COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Branches');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function buildBranchDistribution(rows, storeById, total) {
    const validRows = rows.filter((row) => storeById.has(String(row._id)));
    const otherTotal = rows.filter((row) => !storeById.has(String(row._id))).reduce((sum, row) => sum + row.value, 0);

    const top = validRows.slice(0, TOP_BRANCHES);
    const rest = validRows.slice(TOP_BRANCHES);
    const restTotal = rest.reduce((sum, row) => sum + row.value, 0) + otherTotal;

    return top
        .map((row) => {
            const store = storeById.get(String(row._id));
            return { name: store.name_store, code: store.code_store, value: row.value };
        })
        .concat(restTotal > 0 ? [{ name: 'Other Branches', code: '', value: restTotal }] : [])
        .map((item) => ({ ...item, percent: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0 }));
}

async function attachStoreStats(stores, context) {
    const storeIds = stores.map((store) => String(store._id));

    const [employeeCounts, roomCounts] = await Promise.all([
        storeIds.length
            ? Users(context.tenant).aggregate([
                  { $match: { store_id: { $in: storeIds }, is_delete: { $ne: true } } },
                  { $group: { _id: '$store_id', employees: { $sum: 1 } } },
              ])
            : [],
        storeIds.length
            ? Rooms(context.tenant).aggregate([
                  { $match: { store_id: { $in: storeIds }, is_delete: { $ne: true } } },
                  { $group: { _id: '$store_id', rooms: { $sum: 1 } } },
              ])
            : [],
    ]);

    const employeeCountByStoreId = toMapById(employeeCounts, '_id');
    const roomCountByStoreId = toMapById(roomCounts, '_id');

    for (const store of stores) {
        store.employees_count = employeeCountByStoreId.get(String(store._id))?.employees || 0;
        store.rooms_count = roomCountByStoreId.get(String(store._id))?.rooms || 0;
    }
}

const resolvers = {
    Query: {
        Stores: async (parent, args, context, info) => {
            const result = await selects({
                model: Stores(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    ...(context.scope_store_id ? { _id: context.scope_store_id } : {}),
                },
            });

            const requestedFields = graphqlFields(info)?.data || {};
            if (requestedFields.employees_count || requestedFields.rooms_count) {
                await attachStoreStats(result.data, context);
            }

            return result;
        },

        Stores_export: async (parent, args, context) => {
            const result = await selects({
                model: Stores(context.tenant),
                args,
                find_required: {
                    is_delete: { $ne: true },
                    ...(context.scope_store_id ? { _id: context.scope_store_id } : {}),
                },
                unlimited: true,
            });

            await attachStoreStats(result.data, context);

            const buffer = await buildStoresExportWorkbook(result.data);
            return {
                filename: `branches-${DateTime.now().toFormat('yyyy-LL-dd')}.xlsx`,
                base64: buffer.toString('base64'),
            };
        },

        Stores_stats: async (parent, args, context) => {
            const StoresModel = Stores(context.tenant);
            const UsersModel = Users(context.tenant);
            const RoomsModel = Rooms(context.tenant);

            const storeScope = context.scope_store_id;
            const storeMatch = { is_delete: { $ne: true }, ...(storeScope ? { _id: storeScope } : {}) };
            const userStoreMatch = { is_delete: { $ne: true }, is_super_admin: { $ne: true }, ...(storeScope ? { store_id: storeScope } : {}) };
            const roomStoreMatch = { is_delete: { $ne: true }, ...(storeScope ? { store_id: storeScope } : {}) };

            const [totalBranches, totalRooms, staffAgg, employeeRows, roomRows] = await Promise.all([
                StoresModel.countDocuments(storeMatch),
                RoomsModel.countDocuments(roomStoreMatch),
                UsersModel.aggregate([{ $match: userStoreMatch }, { $group: { _id: null, staff: { $sum: 1 } } }]),
                UsersModel.aggregate([{ $match: userStoreMatch }, { $group: { _id: '$store_id', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
                RoomsModel.aggregate([{ $match: roomStoreMatch }, { $group: { _id: '$store_id', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
            ]);

            const totalStaff = staffAgg[0]?.staff || 0;

            const storeIds = [...new Set([...employeeRows, ...roomRows].map((row) => row._id).filter(Boolean))];
            const stores = storeIds.length
                ? await StoresModel.find({ _id: { $in: storeIds }, is_delete: { $ne: true } })
                      .select('name_store code_store')
                      .lean()
                : [];
            const storeById = toMapById(stores);

            return {
                total_branches: totalBranches,
                total_staff: totalStaff,
                total_rooms: totalRooms,
                branch_distribution: buildBranchDistribution(employeeRows, storeById, totalStaff),
                room_distribution: buildBranchDistribution(roomRows, storeById, totalRooms),
            };
        },
    },

    Mutation: {
        Store_create: async (parent, args, context) => {
            const StoresModel = Stores(context.tenant);
            const data = new StoresModel(args);
            await data.save();

            const store = data.toObject();
            await attachStoreStats([store], context);
            return store;
        },

        Store_update: async (parent, args, context) => {
            const result = await Stores(context.tenant).findByIdAndUpdate(args._id, args, { returnDocument: 'after' }).lean();

            if (!result) throw new Error('Update failed');
            await attachStoreStats([result], context);
            return result;
        },

        Store_delete: async (parent, args, context) => {
            const result = await Stores(context.tenant).findByIdAndUpdate(args._id, { is_delete: true }, { returnDocument: 'after' }).lean();

            if (!result) throw new Error('Delete failed');
            return true;
        },
    },
};

const resolversComposition = {
    'Query.Stores': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Stores_export': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    'Query.Stores_stats': [auth.check_tenant(), auth.authentication(), auth.scope_to_store()],
    // Tạo/sửa/xoá chi nhánh là thao tác cấp công ty, chỉ ADMIN.
    'Mutation.Store_create': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN'])],
    'Mutation.Store_update': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN'])],
    'Mutation.Store_delete': [auth.check_tenant(), auth.authentication(), auth.require_permission(['ADMIN'])],
};

module.exports = composeResolvers(resolvers, resolversComposition);
