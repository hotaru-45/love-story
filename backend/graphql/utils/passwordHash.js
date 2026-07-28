const crypto = require('crypto');
const { promisify } = require('util');

const argon2 = promisify(crypto.argon2);

const TYPE = 'argon2id';
const VERSION = 19; // 0x13, phiên bản Argon2 hiện hành
const PARAMS = { memory: 65536, passes: 3, parallelism: 1, tagLength: 32 }; // 64 MiB, t=3, p=1
const SALT_LENGTH = 16;

function toB64(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '');
}
function fromB64(str) {
  return Buffer.from(str, 'base64');
}

async function hashPassword(plain, pepper) {
  const nonce = crypto.randomBytes(SALT_LENGTH);
  const tag = await argon2(TYPE, {
    message: String(plain),
    nonce,
    secret: Buffer.from(String(pepper)),
    parallelism: PARAMS.parallelism,
    tagLength: PARAMS.tagLength,
    memory: PARAMS.memory,
    passes: PARAMS.passes,
  });
  return `$${TYPE}$v=${VERSION}$m=${PARAMS.memory},t=${PARAMS.passes},p=${PARAMS.parallelism}$${toB64(nonce)}$${toB64(tag)}`;
}

async function verifyPassword(plain, stored, pepper) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$'); // ['', 'argon2id', 'v=19', 'm=...,t=...,p=...', salt, tag]
  if (parts.length !== 6 || parts[1] !== TYPE) return false;

  const version = parseInt((parts[2].split('=')[1] ?? ''), 10);
  if (version !== VERSION) return false;

  const paramMap = {};
  for (const kv of parts[3].split(',')) {
    const [k, v] = kv.split('=');
    paramMap[k] = parseInt(v, 10);
  }

  let nonce;
  let expectedTag;
  try {
    nonce = fromB64(parts[4]);
    expectedTag = fromB64(parts[5]);
  } catch (e) {
    return false;
  }
  if (!Number.isInteger(paramMap.m) || !Number.isInteger(paramMap.t) || !Number.isInteger(paramMap.p) || expectedTag.length === 0) {
    return false;
  }

  let tag;
  try {
    tag = await argon2(TYPE, {
      message: String(plain),
      nonce,
      secret: Buffer.from(String(pepper)),
      parallelism: paramMap.p,
      tagLength: expectedTag.length,
      memory: paramMap.m,
      passes: paramMap.t,
    });
  } catch (e) {
    return false;
  }

  const tagBuf = Buffer.from(tag);
  if (tagBuf.length !== expectedTag.length) return false;
  return crypto.timingSafeEqual(tagBuf, expectedTag);
}

module.exports = { hashPassword, verifyPassword };
