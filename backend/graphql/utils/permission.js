// Không dùng '' làm giá trị "không lọc" — '' trùng với store_id mặc định của user
// chưa được gán chi nhánh, dễ bị hiểu nhầm thành "bỏ qua điều kiện lọc" (xem resolveStoreScope).
// Phải là ObjectId hợp lệ (24 số 0) chứ không phải chuỗi tuỳ ý: giá trị này vừa dùng để lọc
// field String (Users/Rooms.store_id) vừa dùng để lọc field ObjectId (Stores._id) — một chuỗi
// không đúng định dạng ObjectId sẽ khiến Mongoose throw CastError thay vì trả về rỗng.
const NO_STORE_SCOPE = '000000000000000000000000';

function getActor(context) {
    return context.payload?.data || {};
}

function isSuperAdmin(actor) {
    return actor?.is_super_admin === true;
}

function isAdmin(actor) {
    return isSuperAdmin(actor) || actor?.permission === 'ADMIN';
}

// Luôn loại trừ admin trước: dữ liệu thực tế có thể vừa is_super_admin: true
// vừa permission: 'MANAGER' (set từ trước, chưa dọn) — nếu chỉ so permission
// suông thì admin/super_admin sẽ bị nhầm thành MANAGER và bị áp nhầm luật scope chi nhánh.
function isManager(actor) {
    return !isAdmin(actor) && actor?.permission === 'MANAGER';
}

// Giá trị dùng để lọc theo chi nhánh trong query (Users/Rooms/Stores...):
// - ADMIN/super_admin: null → không lọc, xem toàn bộ.
// - MANAGER/STAFF có store_id: lọc đúng chi nhánh đó.
// - MANAGER/STAFF CHƯA có store_id (dữ liệu lỗi/chưa gán): trả về NO_STORE_SCOPE
//   (một giá trị không khớp _id/store_id thật nào) để fail-closed — không thấy gì,
//   thay vì lỡ tay bỏ qua điều kiện lọc và thấy hết mọi chi nhánh.
function resolveStoreScope(actor) {
    if (isAdmin(actor)) return null;
    return actor?.store_id || NO_STORE_SCOPE;
}

// ADMIN/super_admin: quản lý được ai cũng được (trừ super_admin, chỉ tạo/sửa được dưới DB).
// MANAGER: chỉ quản lý được STAFF cùng chi nhánh, và bắt buộc phải có store_id
// (MANAGER chưa gán chi nhánh thì không quản lý được ai — fail-closed).
function assertCanManageUser(actor, target) {
    if (!target) throw new Error('User not found');
    if (isSuperAdmin(target)) throw new Error('permission_denied');
    if (isAdmin(actor)) return;
    if (isManager(actor) && actor.store_id && target.permission === 'STAFF' && String(target.store_id || '') === String(actor.store_id)) {
        return;
    }
    throw new Error('permission_denied');
}

// Không cho phi-ADMIN tự set is_super_admin; MANAGER thì cũng không được đổi permission/store_id
// (tránh tự thăng quyền hoặc chuyển nhân sự sang chi nhánh khác).
function sanitizeUserMutationArgs(actor, args) {
    delete args.is_super_admin;
    if (!isAdmin(actor)) {
        delete args.permission;
        delete args.store_id;
    }
    return args;
}

// Dùng cho resource gắn store_id (room...): ADMIN thao tác được mọi chi nhánh,
// còn lại chỉ thao tác được đúng chi nhánh của mình — và bắt buộc phải có store_id.
function assertSameStoreOrAdmin(actor, targetStoreId) {
    if (isAdmin(actor)) return;
    if (!actor?.store_id || String(targetStoreId || '') !== String(actor.store_id)) {
        throw new Error('permission_denied');
    }
}

module.exports = {
    getActor,
    isSuperAdmin,
    isAdmin,
    isManager,
    resolveStoreScope,
    assertCanManageUser,
    sanitizeUserMutationArgs,
    assertSameStoreOrAdmin,
};
