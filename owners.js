// Même logique que sur le bot de modération : ces IDs ont les pleins pouvoirs (ex : -reset all).
const DEFAULT_OWNERS = ['1534863727822639254'];
const fromEnv = (process.env.OWNER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
const OWNER_IDS = [...new Set([...DEFAULT_OWNERS, ...fromEnv])];

function isOwner(guild, userId) {
  return userId === guild.ownerId || OWNER_IDS.includes(userId);
}

module.exports = { OWNER_IDS, isOwner };
