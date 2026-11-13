const { resetGuild } = require('../utils/economy');
const { isOwner } = require('../utils/owners');
const { reply, COLORS } = require('../utils/helpers');

const CONFIRM_WORD = 'CONFIRMER';

module.exports = {
  name: 'reset',
  description: 'Remet à zéro l’argent de tout le monde sur ce serveur (réservé à toi)',
  usage: `reset all ${CONFIRM_WORD}`,
  category: 'admin',
  async execute(message, args, client) {
    if (!isOwner(message.guild, message.author.id)) {
      return reply(message, '❌ Cette commande est réservée au propriétaire du serveur et aux owners du bot.', COLORS.error);
    }
    if (args[0]?.toLowerCase() !== 'all') {
      return reply(message, `❌ Utilisation : \`${client.prefix}reset all ${CONFIRM_WORD}\``, COLORS.error);
    }
    if (args[1] !== CONFIRM_WORD) {
      return reply(
        message,
        `⚠️ Ça va remettre à **zéro l'argent de tout le monde** sur ce serveur.\nPour confirmer : \`${client.prefix}reset all ${CONFIRM_WORD}\``,
        COLORS.error
      );
    }

    const changes = resetGuild(message.guild.id);
    return reply(message, `✅ Économie remise à zéro (${changes} compte(s) effacé(s)).`, COLORS.success);
  },
};
