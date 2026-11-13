const { PermissionFlagsBits: P, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { setConfig, delConfig, getConfig } = require('../database');
const { reply, COLORS } = require('../utils/helpers');

const GIF_URL = 'https://media.tenor.com/O0N7PF1nFMMAAAAC/poker-cards.gif';

module.exports = {
  name: 'setcasino',
  description: 'Crée le salon d’accès au casino (le rôle Casino s’obtient en cliquant sur l’embed)',
  usage: 'setcasino [off]',
  category: 'config',
  permissions: [P.Administrator],
  async execute(message, args) {
    const guild = message.guild;

    if (args[0]?.toLowerCase() === 'off') {
      await guild.channels.cache.get(getConfig(guild.id, 'casino_channel') || '')?.delete('Casino désactivé').catch(() => {});
      delConfig(guild.id, 'casino_channel');
      delConfig(guild.id, 'casino_role');
      return reply(message, '✅ Accès casino désactivé.', COLORS.success);
    }

    let role = guild.roles.cache.find((r) => r.name === 'Casino');
    if (!role) role = await guild.roles.create({ name: 'Casino', color: 0xf5c518, reason: 'Accès casino' });
    setConfig(guild.id, 'casino_role', role.id);

    const channel = await guild.channels.create({
      name: '🎰・casino',
      type: ChannelType.GuildText,
      reason: 'Accès casino',
    });
    setConfig(guild.id, 'casino_channel', channel.id);

    const embed = new EmbedBuilder()
      .setColor(COLORS.gold)
      .setTitle('🎰 Casino Yozira')
      .setDescription('Clique sur le bouton pour accéder au casino et débloquer les commandes de jeu.')
      .setImage(GIF_URL);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('casino_join').setLabel('Accéder au casino').setEmoji('🎰').setStyle(ButtonStyle.Success)
    );
    await channel.send({ embeds: [embed], components: [row] });

    return reply(message, `✅ Salon ${channel} créé avec le rôle ${role}.`, COLORS.success);
  },
};
