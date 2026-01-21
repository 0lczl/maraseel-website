const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
