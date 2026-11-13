const { getConfig } = require('../database');
const { reply, COLORS } = require('./helpers');

// Si un rôle Casino est configuré (-setcasino), il faut l'avoir pour jouer. Sinon, tout le monde peut jouer.
function requireCasino(message) {
  const roleId = getConfig(message.guild.id, 'casino_role');
  if (!roleId) return true;
  if (message.member.roles.cache.has(roleId)) return true;
  reply(message, `🎰 Il te faut le rôle <@&${roleId}> pour accéder au casino.`, COLORS.error);
  return false;
}

module.exports = { requireCasino };
