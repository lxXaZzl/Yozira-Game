const { DatabaseSync } = require('node:sqlite'); // SQLite intégré à Node, rien à compiler
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'bot.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    guild_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (guild_id, key)
  );
  CREATE TABLE IF NOT EXISTS economy (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    wallet INTEGER NOT NULL DEFAULT 0,
    bank INTEGER NOT NULL DEFAULT 0,
    vip INTEGER NOT NULL DEFAULT 0,
    faucheur INTEGER NOT NULL DEFAULT 0,
    last_daily INTEGER NOT NULL DEFAULT 0,
    last_work INTEGER NOT NULL DEFAULT 0,
    last_rob INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS drops (
    message_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    claimed INTEGER NOT NULL DEFAULT 0
  );
`);

function getConfig(guildId, key) {
  const row = db.prepare('SELECT value FROM config WHERE guild_id = ? AND key = ?').get(guildId, key);
  return row ? row.value : null;
}
function setConfig(guildId, key, value) {
  db.prepare(
    `INSERT INTO config (guild_id, key, value) VALUES (?, ?, ?)
     ON CONFLICT(guild_id, key) DO UPDATE SET value = excluded.value`
  ).run(guildId, key, String(value));
}
function delConfig(guildId, key) {
  db.prepare('DELETE FROM config WHERE guild_id = ? AND key = ?').run(guildId, key);
}

module.exports = { db, getConfig, setConfig, delConfig };
