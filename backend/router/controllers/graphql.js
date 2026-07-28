const ejs = require('ejs');
const jws = require('jws');
const path = require('path');

const formidable = require('formidable');
const { graphql, parse, Source, validate } = require('graphql');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { DateTime } = require('luxon');

const logger = require('../../logger');
const depthLimitQuery = require('../../graphql/utils/depthLimitQuery');
const disableIntrospection = require('../../graphql/utils/disableIntrospection');
const parseCookies = require('../utils/parseCookies');
const setCors = require('../utils/cors');
const fieldSelect = require('../../graphql/utils/fieldSelect');
const { LogAPI, isValidTenant } = require('../../models');
const { qsfind, qsParse } = require('../../graphql/utils/selectGraphql');
const { sanitizeVariables, sanitizeHeaders } = require('../../graphql/utils/sanitizeLog');

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, '../../graphql/schema/**'), {
    recursive: false,
    extensions: ['gql'],
  })
);
const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, '../../graphql/schema/**'), {
    recursive: false,
    extensions: ['js'],
  })
);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const validationRules =
  process.env.NODE_ENV !== 'production' ? [depthLimitQuery(6)] : [depthLimitQuery(6), disableIntrospection];

function createDocument(query) {
  const source = new Source(query);
  return parse(source);
}

async function log_API(context, query, variables, headers, error) {
  const rawTenant = context?.tenant;
  const tenant = (await isValidTenant(rawTenant)) ? rawTenant : 'master';
  var logAPIs = LogAPI(tenant);
  const logAPI = new logAPIs({
    username: context?.payload?.data?.username ?? '',
    query: query,
    variables: sanitizeVariables(variables),
    headers: sanitizeHeaders(headers),
    ip: context?.remoteAddress ?? '',
    error: error,
    time: DateTime.now().toSeconds(),
  });
  await logAPI.save();
}

function removeNulls(obj) {
  var isArray = obj instanceof Array;
  for (var k in obj) {
    if (obj[k] === null || obj[k] === undefined) isArray ? obj.splice(k, 1) : delete obj[k];
    else if (typeof obj[k] == 'object') removeNulls(obj[k]);
  }
  return obj;
}

// GET /graphql — GraphiQL playground
function graphiql(req, res, params) {
  ejs.renderFile(path.join(__dirname, '../../graphql/utils/graphiql.ejs'), {}, (err, str) => {
    if (!err) {
      res.end(str);
    } else {
      res.end('{"detail":"Faild"}');
    }
  });
}

// POST /graphql — thực thi query/mutation
function graphqlHandler(req, res, params) {
  var form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      logger.error(err);
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    var context = {};
    context.token = req?.headers?.token || parseCookies(req)?.token || undefined;
    context.tenant = req?.headers?.tenant || parseCookies(req)?.tenant || undefined;
    context.reqHeaders = req.headers;
    try {
      if (req.headers['content-type'].includes('application/json') && fields.query) {
        var decode = jws.decode(context.token);
        context.payload = decode?.payload === undefined ? null : JSON.parse(decode?.payload);
        var validateRes = validate(schema, createDocument(fields.query), validationRules);
        logger.http('\n' + fields.query);
        if (validateRes == 0) {
          var fieldS = fieldSelect.rootFields(fields.query);
          context.remoteAddress = req.socket.remoteAddress;
          if (fieldS.includes('login')) {
            if (fieldS.includes("__typename") ? fieldS.length > 2 : fieldS.length > 1) {
              throw new Error('Multiple queries are not allowed when login');
            }
          }
          graphql({
            schema: schema,
            source: fields.query,
            variableValues: fields.variables,
            contextValue: context,
          })
            .then((result) => {
              if (result?.errors?.length > 0) {
                logger.error(result?.errors);
              }
              if (
                (result?.data?.mobi_login === null || result?.data?.mobi_User_change_password === null) &&
                result?.errors?.length > 0
              ) {
                result.data.error = result.errors[0];
                delete result.errors;
              }
              if (!fieldS.includes('login')) {
                log_API(context, fields.query, fields.variables, req?.headers, result.errors);
              }
              setCors(req, res);
              res.writeHead(
                200,
                removeNulls({
                  'Content-Type': 'application/json',
                  'Set-Cookie': result?.data?.Tenant
                    ? 'tenant=' + result.data.Tenant + '; SameSite=Strict; HttpOnly; Path=/graphql'
                    : result?.data?.login?.token
                      ? 'token=' + result.data.login.token + '; SameSite=Strict; HttpOnly; Path=/graphql'
                      : result?.data?.LoginMaster?.token
                        ? 'token=' + result.data.LoginMaster.token + '; SameSite=Strict; HttpOnly; Path=/graphql'
                        : result?.data?.tfa?.token
                          ? 'token=' + result.data.tfa.token + '; SameSite=Strict; HttpOnly; Path=/graphql'
                          : undefined,
                })
              );

              if (fields?.variables?.qsfind) {
                var qs_find = fields?.variables?.qsfind;
                if ('string' === typeof qs_find) {
                  qs_find = qsParse(qs_find);
                } else if (Array.isArray(qs_find)) {
                  qs_find = qs_find.map((item) => {
                    if ('string' === typeof item) {
                      return qsParse(item);
                    } else {
                      return qsfind(item);
                    }
                  });
                } else {
                  qs_find = qsfind(qs_find);
                }
                const text = JSON.stringify({ qsfind: qs_find, ...result });
                res.end(text);
              } else {
                const text = JSON.stringify(result);
                res.end(text);
              }
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        } else {
          throw new Error(validateRes);
        }
      } else {
        throw new Error('');
      }
    } catch (error) {
      log_API(context, fields.query, fields.variables, req?.headers, error.message);
      logger.error(error.message);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(
        JSON.stringify({
          errors: [
            {
              message: error.message,
            },
          ],
        })
      );
    }
  });
}

module.exports = { graphiql, graphqlHandler };
