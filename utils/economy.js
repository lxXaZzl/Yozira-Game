const { db } = require('../database');

function ensure(guildId, userId) {
  db.prepare('INSERT OR IGNORE INTO economy (guild_id, user_id) VALUES (?, ?)').run(guildId, userId);
}

function getAccount(guildId, userId) {
  ensure(guildId, userId);
  return db.prepare('SELECT * FROM economy WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
}

function addWallet(guildId, userId, amount) {
  ensure(guildId, userId);
  db.prepare('UPDATE economy SET wallet = MAX(0, wallet + ?) WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  return getAccount(guildId, userId).wallet;
}

function addBank(guildId, userId, amount) {
  ensure(guildId, userId);
  db.prepare('UPDATE economy SET bank = MAX(0, bank + ?) WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  return getAccount(guildId, userId).bank;
}

function setField(guildId, userId, field, value) {
  ensure(guildId, userId);
  db.prepare(`UPDATE economy SET ${field} = ? WHERE guild_id = ? AND user_id = ?`).run(value, guildId, userId);
}

// VIP : x4 sur les gains des jeux au lieu de x2
function winMultiplier(account) {
  return account.vip ? 4 : 2;
}

function resetGuild(guildId) {
  const { changes } = db.prepare('DELETE FROM economy WHERE guild_id = ?').run(guildId);
  return changes;
}

function topWallet(guildId, limit = 10) {
  return db
    .prepare('SELECT user_id, wallet, bank FROM economy WHERE guild_id = ? ORDER BY (wallet + bank) DESC LIMIT ?')
    .all(guildId, limit);
}

module.exports = { ensure, getAccount, addWallet, addBank, setField, winMultiplier, resetGuild, topWallet };
