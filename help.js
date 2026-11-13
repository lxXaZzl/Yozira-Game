const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/helpers');

const SECTIONS = [
  ['casino', '🎰 Casino'],
  ['config', '⚙️ Configuration'],
  ['admin', '🛠️ Admin'],
];

module.exports = {
  name: 'help',
  aliases: ['aide'],
  description: 'Liste des commandes',
  usage: 'help',
  category: 'general',
  async execute(message, args, client) {
    const commands = [...new Set(client.commands.values())];
    const blocks = SECTIONS.map(([category, title]) => {
      const lines = commands
        .filter((c) => c.category === category)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => `\`${client.prefix}${c.usage}\``);
      return lines.length ? `**${title}**\n${lines.join('\n')}` : null;
    }).filter(Boolean);

    const embed = new EmbedBuilder().setColor(COLORS.main).setTitle('🎰 Commandes Yozira').setDescription(blocks.join('\n\n'));
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
