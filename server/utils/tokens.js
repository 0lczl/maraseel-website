const crypto = require('crypto');

// Generate a random secure token (raw)
function generateToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 character hex string
}

// Hash a token for storage (only store hashed tokens)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateToken, hashToken };
