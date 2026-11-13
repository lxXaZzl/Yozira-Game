const { MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { db, getConfig } = require('../database');
const { addWallet } = require('../utils/economy');
const { money } = require('../utils/helpers');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() || !interaction.guild) return;

    if (interaction.customId === 'casino_join') {
      const roleId = getConfig(interaction.guild.id, 'casino_role');
      const role = roleId && interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.reply({ content: "❌ Le casino n'est pas configuré.", flags: MessageFlags.Ephemeral });
      if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({ content: '✅ Tu as déjà accès au casino !', flags: MessageFlags.Ephemeral });
      }
      await interaction.member.roles.add(role, 'Accès casino').catch(() => {});
      return interaction.reply({ content: '🎰 Tu as maintenant accès au casino, amuse-toi bien !', flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'drop_claim') {
      const drop = db.prepare('SELECT * FROM drops WHERE message_id = ?').get(interaction.message.id);
      if (!drop || drop.claimed) {
        return interaction.reply({ content: '❌ Ce drop a déjà été récupéré.', flags: MessageFlags.Ephemeral });
      }
      db.prepare('UPDATE drops SET claimed = 1 WHERE message_id = ?').run(drop.message_id);
      addWallet(interaction.guild.id, interaction.user.id, drop.amount);

      const row = interaction.message.components[0];
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components.map((c) => ButtonBuilder.from(c).setDisabled(true))
      );
      await interaction.update({ components: [disabledRow] }).catch(() => {});
      return interaction.followUp({ content: `💰 Tu as récupéré **${money(drop.amount)}** !`, flags: MessageFlags.Ephemeral });
    }
  },
};
