const crypto = require('crypto');

function hmacSHA512Hex(message, key) {
  return crypto.createHmac('sha512', String(key)).update(String(message)).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || a.length === 0) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

module.exports = { hmacSHA512Hex, safeEqualHex };
