const jws = require('jws');
const { randomBytes } = require('crypto');
const { DateTime } = require('luxon');
const { SECRET, SECRET_MASTER, MASTER_LOGIN, MANAGER_ORG } = require('../../constants');
const { verifyPassword } = require('../utils/passwordHash');
const { hmacSHA512Hex, safeEqualHex } = require('../utils/hmac');
const { composeResolvers } = require('@graphql-tools/resolvers-composition');
const auth = require('../auth');
const { Users, UserMasters, BlockLoginAccess, Companies, RoleControl, Stores, LogLogin } = require('../../models');
const graphqlFields = require('../utils/graphql-fields');
const { sanitizeHeaders, sanitizeToken } = require('../utils/sanitizeLog');
const { logSystemActivity } = require('../utils/systemLog');

const SETTINGS_CHANGE_EXCLUDED_FIELDS = new Set(['_id']);

function buildSettingsChanges(args, previous, updated) {
  const keys = Object.keys(args).filter((key) => !SETTINGS_CHANGE_EXCLUDED_FIELDS.has(key));
  if (keys.length === 0) return null;

  const before = {};
  const after = {};
  for (const key of keys) {
    before[key] = previous?.[key];
    after[key] = updated?.[key];
  }
  return { before, after };
}

function settingsEntityLabel(args) {
  const keys = Object.keys(args).filter((key) => key !== '_id');
  return keys.length ? `Settings: ${keys.join(', ')}` : 'Settings';
}

function authActor(userDoc, username) {
  if (!userDoc) return { username };
  return {
    _id: userDoc._id,
    full_name: userDoc.full_name,
    username: userDoc.username,
    mail: userDoc.mail,
    permission: userDoc.permission,
    is_super_admin: userDoc.is_super_admin,
  };
}

async function logAuthActivity(context, { status, username, userDoc }) {
  await logSystemActivity(context, {
    action: 'login',
    module: 'Authentication',
    details: status === 'success' ? 'User login' : 'Login attempt failed',
    entity: status === 'success' ? 'Login successful' : `Username: ${username}`,
    status,
    resolverName: 'login',
    actor: authActor(userDoc, username),
  });
}

const resolvers = {
  Query: {
    login: async (parent, args, context, info) => {
      const tenant = await Companies().findOne({ id_tenant: context.tenant }).lean();
      const UsersBlock = await BlockLoginAccess()
        .findOne({
          username: args.username,
          id_tenant: context.tenant,
        })
        .lean();

      if (
        tenant?.max_login > 0 &&
        UsersBlock?.count_time_login_fail >= tenant.max_login &&
        (tenant?.lockout_time > 0
          ? Math.abs(DateTime.fromSeconds(+UsersBlock.time_login).diffNow().toMillis()) / 60000 < tenant.lockout_time
          : true)
      ) {
        log_login(args.username, context, 'failed');
        logAuthActivity(context, { status: 'failed', username: args.username });
        throw new Error('error_login_102,Too many failed login');
      }

      const data = await Users(context.tenant)
        .findOne({
          username: args.username,
          is_lock: { $ne: true },
          is_delete: { $ne: true },
        })
        .lean();

      if (data && (await verifyPassword(args.password, data.password, SECRET.SECRET_PASS + context.tenant))) {
        const infoQuery = graphqlFields(info);
        const salt = randomBytes(16).toString('hex');
        const client_secret = hmacSHA512Hex(salt, SECRET.SECRET_PASS + context.tenant);

        const result = await Users(context.tenant)
          .findByIdAndUpdate(
            data._id,
            {
              status: 1,
              client_secret: infoQuery?.client_secret ? client_secret : undefined,
            },
            { returnDocument: 'after' }
          )
          .lean();

        const roleControl = result?.id_role ? await RoleControl(context.tenant)
          .findOne({ _id: result?.id_role, is_delete: { $ne: true } })
          .lean() : null;

        delete result.password;
        delete result.client_secret;
        delete result.created_at;
        delete result.updated_at;
        delete result.__v;

        const store = await Stores(context.tenant).findOne({ code_store: data?.code_store }).lean();

        if (!data.is_super_admin) {
          const isMobile = info.fieldNodes[0]?.alias?.value?.includes('mobi_');
          if (isMobile ? roleControl?.mode_sigin === 1 : roleControl?.mode_sigin === 2) {
            log_login(args.username, context, 'mobi_failed');
            logAuthActivity(context, { status: 'failed', username: args.username, userDoc: data });
            throw new Error('not permission device!');
          }
        }

        const token = jws.sign({
          header: { alg: 'HS256' },
          payload: {
            sub: String(result._id),
            tenant: context.tenant,
            iat: DateTime.now().toSeconds(),
            data: {
              ...result,
              arr_role: roleControl?.arr_role,
              is_admin: (roleControl?.is_admin || data.is_super_admin) ?? false,
            },
          },
          secret: SECRET.SECRET_TOKEN + context.tenant,
        });

        await BlockLoginAccess().deleteMany({ username: args.username, id_tenant: context.tenant });
        log_login(args.username, context, token);
        logAuthActivity(context, { status: 'success', username: args.username, userDoc: result });
        return { token, id_tenant: context.tenant, client_secret: salt, data };
      }

      let timeBlock = 0;
      if (tenant?.max_login > 0 && data?.is_super_admin !== true) {
        timeBlock = (UsersBlock?.count_time_login_fail ?? 0) < tenant.max_login
          ? (UsersBlock?.count_time_login_fail ?? 0) + 1
          : 1;
        await BlockLoginAccess()
          .updateOne(
            { username: args.username, id_tenant: context.tenant },
            { time_login: DateTime.now().toSeconds(), count_time_login_fail: timeBlock },
            { upsert: true }
          )
          .lean();
      }

      log_login(args.username, context, 'failed');
      logAuthActivity(context, { status: 'failed', username: args.username });
      throw new Error(`error_login_100,${timeBlock},${timeBlock === 0 ? 0 : tenant.max_login}`);
    },

    reset_token: async (parent, args, context) => {
      const client_secret = hmacSHA512Hex(args.client_secret, SECRET.SECRET_PASS + context.tenant);
      const data = await Users(context.tenant)
        .findOne({ username: args.username })
        .lean();

      if (data && !data.is_delete && safeEqualHex(data.client_secret, client_secret)) {
        delete data.password;
        delete data.client_secret;
        delete data.created_at;
        delete data.updated_at;
        delete data.__v;

        const token = jws.sign({
          header: { alg: 'HS256' },
          payload: {
            sub: String(data._id),
            tenant: context.tenant,
            iat: DateTime.now().toSeconds(),
            exp: DateTime.now().plus({ hours: args?.bio ? 12 : 1 }).toSeconds(),
            data,
          },
          secret: SECRET.SECRET_TOKEN + context.tenant,
        });
        return { token, client_secret: args.client_secret, data };
      }
      throw new Error('Reset token fail');
    },

    LoginMaster: async (parent, args, context) => {
      const MASTER_TENANT = 'master';
      const masterBlock = await BlockLoginAccess()
        .findOne({ username: args.username, id_tenant: MASTER_TENANT })
        .lean();

      if (
        MASTER_LOGIN.MAX_LOGIN > 0 &&
        masterBlock?.count_time_login_fail >= MASTER_LOGIN.MAX_LOGIN &&
        Math.abs(DateTime.fromSeconds(+masterBlock.time_login).diffNow().toMillis()) / 60000 < MASTER_LOGIN.LOCKOUT_TIME
      ) {
        throw new Error('error_login_102,Too many failed login');
      }

      const data = await UserMasters()
        .findOne({ username: args.username })
        .lean();

      const loginFail = async () => {
        const count =
          (masterBlock?.count_time_login_fail ?? 0) < MASTER_LOGIN.MAX_LOGIN
            ? (masterBlock?.count_time_login_fail ?? 0) + 1
            : 1;
        await BlockLoginAccess()
          .updateOne(
            { username: args.username, id_tenant: MASTER_TENANT },
            { time_login: DateTime.now().toSeconds(), count_time_login_fail: count },
            { upsert: true }
          )
          .lean();
        throw new Error('login fail');
      };

      if (!data || data.is_delete) {
        return loginFail();
      }

      if (!(await verifyPassword(args.password, data.password, SECRET_MASTER.SECRET_PASS))) {
        return loginFail();
      }

      await BlockLoginAccess().deleteMany({ username: args.username, id_tenant: MASTER_TENANT });

      const result = await UserMasters().findByIdAndUpdate(data._id, { status: 1 }, { returnDocument: 'after' }).lean();
      delete result.password;
      delete result.client_secret;
      delete result.created_at;
      delete result.updated_at;
      delete result.__v;

      const token = jws.sign({
        header: { alg: 'HS256' },
        payload: {
          iat: DateTime.now().toSeconds(),
          exp: DateTime.now().plus({ hours: 1 }).toSeconds(),
          data: result,
        },
        secret: SECRET_MASTER.SECRET_TOKEN,
      });
      return { token, data };
    },

    SetingAdministrator: async (parent, args, context) => {
      const tenant = await Companies().findOne({ id_tenant: context.tenant }).lean();
      return tenant;
    },

    check_password: async (parent, args, context) => {
      const _user = context.payload.data;
      const data = await Users(context.tenant)
        .findOne({ username: _user.username })
        .lean();

      if (data && !data.is_delete && (await verifyPassword(args.password, data.password, SECRET.SECRET_PASS + context.tenant))) {
        return true;
      }
      return false;
    },
  },

  login: {
    change_password: async (parent, args, context) => {
      if (!parent?.data?.is_super_admin) {
        const tenant = await Companies().findOne({ id_tenant: context.tenant }).lean();
        if (
          tenant?.password_expire > 0 &&
          parent.data.password_date &&
          Math.abs(DateTime.fromSeconds(+parent.data.password_date).diffNow().toMillis()) / 86400000 >= tenant.password_expire
        ) {
          return true;
        }
      }
      return false;
    },
    data_change_password: async (parent, args, context) => {
      if (!parent?.data?.is_super_admin) {
        const tenant = await Companies().findOne({ id_tenant: context.tenant }).lean();
        if (tenant?.password_expire > 0 && parent.data.password_date) {
          return DateTime.fromSeconds(+parent.data.password_date + tenant.password_expire * 86400).toMillis();
        }
      }
      return 0;
    },
  },

  Mutation: {
    SetingAdministrator_update: async (parent, args, context) => {
      const startedAt = Date.now();
      const previous = await Companies().findOne({ id_tenant: context.tenant }).lean();
      const tenant = await Companies().findOneAndUpdate({ id_tenant: context.tenant }, args, { returnDocument: 'after' }).lean();

      await logSystemActivity(context, {
        action: 'updated',
        module: 'Settings',
        details: 'Updated system settings',
        entity: settingsEntityLabel(args),
        changes: buildSettingsChanges(args, previous, tenant),
        resolverName: 'SetingAdministrator_update',
        startedAt,
      });

      return tenant;
    },

    Logout: async (parent, args, context) => {
      await logSystemActivity(context, {
        action: 'logout',
        module: 'Authentication',
        details: 'User logout',
        entity: 'Logout successful',
        resolverName: 'Logout',
      });
      return true;
    },
  },
};

async function log_login(username, context, acess_token) {
  const LogLogins = LogLogin(context.tenant);
  const logLogin = new LogLogins({
    username,
    ip: context.remoteAddress,
    acess_token: sanitizeToken(acess_token),
    headers: sanitizeHeaders(context.reqHeaders),
    time: DateTime.now().toSeconds(),
  });
  await logLogin.save();
}

const resolversComposition = {
  'Query.login': [auth.check_company()],
  'Query.reset_token': [auth.check_tenant()],
  'Query.SetingAdministrator': [auth.check_tenant(), auth.authentication()],
  'Query.check_password': [auth.check_tenant(), auth.authentication()],
  'Mutation.SetingAdministrator_update': [auth.check_tenant(), auth.authentication()],
  'Mutation.Logout': [auth.check_tenant(), auth.authentication()],
};

module.exports = composeResolvers(resolvers, resolversComposition);
