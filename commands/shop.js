const { EmbedBuilder } = require('discord.js');
const { ITEMS } = require('../utils/shop');
const { COLORS, money } = require('../utils/helpers');

module.exports = {
  name: 'shop',
  aliases: ['boutique'],
  description: 'La boutique du casino',
  usage: 'shop',
  category: 'casino',
  async execute(message, args, client) {
    const lines = Object.entries(ITEMS).map(
      ([key, item]) => `${item.emoji} **${item.label}** — ${money(item.price)}\n\`${client.prefix}buy ${key}\``
    );
    const embed = new EmbedBuilder()
      .setColor(COLORS.gold)
      .setTitle('🛒 Boutique Yozira')
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: 'VIP double le multiplicateur des jeux (x2 -> x4)' });
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
