const { PermissionFlagsBits: P, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../database');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');

// Comme +drop, mais l'argent est créé gratuitement par l'admin (pas pris sur son portefeuille)
module.exports = {
  name: 'cadeaux',
  description: 'Fait apparaître de l’argent gratuit pour le premier qui clique (admin)',
  usage: 'cadeaux <montant>',
  category: 'admin',
  permissions: [P.ManageGuild],
  async execute(message, args) {
    const amount = parseAmount(args[0]);
    if (!amount) return usage(message, this);

    const embed = new EmbedBuilder()
      .setColor(COLORS.gold)
      .setTitle('🎉 Cadeau du staff !')
      .setDescription(`Le staff offre **${money(amount)}** !\nLe premier qui clique le récupère.`);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('drop_claim').setLabel('Récupérer').setEmoji('💰').setStyle(ButtonStyle.Success)
    );

    const sent = await message.channel.send({ embeds: [embed], components: [row] });
    db.prepare('INSERT INTO drops (message_id, guild_id, amount, claimed) VALUES (?, ?, ?, 0)').run(sent.id, message.guild.id, amount);
    await message.delete().catch(() => {});
  },
};
