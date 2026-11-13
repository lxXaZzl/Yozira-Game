const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../database');
const { getAccount, addWallet } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

module.exports = {
  name: 'drop',
  description: 'Donne de l’argent de ta poche : le premier qui clique le récupère',
  usage: 'drop <montant>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const amount = parseAmount(args[0]);
    if (!amount) return usage(message, this);
    if (amount > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -amount);

    const embed = new EmbedBuilder()
      .setColor(COLORS.gold)
      .setTitle('🎁 Drop !')
      .setDescription(`${author} fait tomber **${money(amount)}**.\nLe premier qui clique le récupère !`);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('drop_claim').setLabel('Récupérer').setEmoji('💰').setStyle(ButtonStyle.Success)
    );

    const sent = await message.channel.send({ embeds: [embed], components: [row] });
    db.prepare('INSERT INTO drops (message_id, guild_id, amount, claimed) VALUES (?, ?, ?, 0)').run(sent.id, guild.id, amount);
    await message.delete().catch(() => {});

    setTimeout(async () => {
      const drop = db.prepare('SELECT * FROM drops WHERE message_id = ?').get(sent.id);
      if (drop && !drop.claimed) {
        addWallet(guild.id, author.id, amount); // personne n'a cliqué, on rend l'argent
        db.prepare('DELETE FROM drops WHERE message_id = ?').run(sent.id);
        embed.setDescription(`${author} a fait tomber **${money(amount)}**, mais personne ne l'a récupéré. Argent rendu.`);
        row.components[0].setDisabled(true);
        await sent.edit({ embeds: [embed], components: [row] }).catch(() => {});
      }
    }, 5 * 60_000);
  },
};
