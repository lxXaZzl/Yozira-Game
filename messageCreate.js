const { reply, COLORS } = require('../utils/helpers');
const { isOwner } = require('../utils/owners');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    const command = client.commands.get(name);
    if (!command) return;

    const owner = isOwner(message.guild, message.author.id);
    if (command.permissions?.length && !owner && !message.member.permissions.has(command.permissions)) {
      return reply(message, "❌ Tu n'as pas la permission d'utiliser cette commande.", COLORS.error);
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[commande ${command.name}]`, err);
      reply(message, '❌ Une erreur est survenue (vérifie mes permissions).', COLORS.error).catch(() => {});
    }
  },
};
