const jws = require('jws');
const { DateTime } = require('luxon');
const parseCookies = require('./parseCookies');
const { SECRET, SECRET_MASTER } = require('../../constants');

function queryParams(req) {
  try {
    return new URL(req.url, 'http://internal').searchParams;
  } catch {
    return null;
  }
}

function verifyToken(req) {
  const query = queryParams(req);
  // Query-param fallback: <img src> không gửi được custom header/cookie cross bối cảnh nào đó,
  // nên /load-file cho phép truyền token+tenant qua query string.
  const token = req?.headers?.token || parseCookies(req)?.token || query?.get('token');
  if (!token) return null;
  const tenant = req?.headers?.tenant || parseCookies(req)?.tenant || query?.get('tenant');

  try {
    const secrets = [];
    if (tenant) secrets.push(SECRET.SECRET_TOKEN + tenant);
    secrets.push(SECRET_MASTER.SECRET_TOKEN);

    const valid = secrets.some((secret) => {
      try {
        return jws.verify(token, 'HS256', secret);
      } catch {
        return false;
      }
    });
    if (!valid) return null;

    const decode = jws.decode(token);
    const payload = decode?.payload === undefined ? null : JSON.parse(decode.payload);
    if (!payload || DateTime.fromSeconds(payload.iat) < DateTime.local().minus({ hours: 12 })) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = verifyToken;
