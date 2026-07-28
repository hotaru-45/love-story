const jws = require('jws');
const { DateTime } = require('luxon');
const { SECRET, SECRET_MASTER } = require('../../constants');
const { Companies } = require('../../models');

module.exports = {
    authentication: () => (next) => async (root, args, context, info) => {
        try {
            if (jws.verify(context.token, 'HS256', SECRET.SECRET_TOKEN + context.tenant)) {
                if (DateTime.fromSeconds(context.payload.iat) >= DateTime.local().minus({ hours: 12 })) {
                    return next(root, args, context, info);
                }
            }
        } catch {}
        throw new Error('You are not authenticated!');
    },
    authentication_master: () => (next) => async (root, args, context, info) => {
        try {
            if (jws.verify(context.token, 'HS256', SECRET_MASTER.SECRET_TOKEN)) {
                if (DateTime.fromSeconds(context.payload.iat) >= DateTime.local().minus({ hours: 12 })) {
                    return next(root, args, context, info);
                }
            }
        } catch {}
        throw new Error('You are not authentication_master!');
    },
    check_tenant: () => (next) => async (root, args, context, info) => {
        const tenant = await Companies().findOne({ id_tenant: context.tenant }).lean();
        if (tenant) {
            return next(root, args, context, info);
        }
        throw new Error('tenant not exist');
    },
    check_company: () => (next) => async (root, args, context, info) => {
        const code = args.code_company?.toUpperCase();
        if (!code) throw new Error('Mã công ty là bắt buộc');
        const company = await Companies()
            .findOne({ code_company: code, is_delete: { $ne: true } })
            .lean();
        if (!company) throw new Error('Mã công ty không tồn tại');
        context.tenant = company.id_tenant;
        return next(root, args, context, info);
    },
};
