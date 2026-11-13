const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getAccount, addWallet, winMultiplier } = require('../utils/economy');
const { buildDeck, fmtHand, blackjackValue } = require('../utils/cards');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

function buildEmbed({ player, dealer, hideDealer, bet, status }) {
  const dealerHand = hideDealer ? `${fmtHand([dealer[0]])} 🂠` : fmtHand(dealer);
  const dealerScore = hideDealer ? '' : ` (${blackjackValue(dealer)})`;
  return new EmbedBuilder()
    .setColor(status ? (status.win ? COLORS.success : status.push ? COLORS.main : COLORS.error) : COLORS.main)
    .setTitle('🃏 Blackjack')
    .setDescription(
      `Mise : **${money(bet)}**\n\n` +
        `**Croupier**${dealerScore}\n${dealerHand}\n\n` +
        `**Toi** (${blackjackValue(player)})\n${fmtHand(player)}` +
        (status ? `\n\n${status.text}` : '')
    );
}

function buildRow(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('bj_hit').setLabel('Tirer').setEmoji('🂠').setStyle(ButtonStyle.Primary).setDisabled(disabled),
    new ButtonBuilder().setCustomId('bj_stand').setLabel('Rester').setEmoji('✋').setStyle(ButtonStyle.Secondary).setDisabled(disabled)
  );
}

module.exports = {
  name: 'bj',
  aliases: ['blackjack'],
  description: 'Blackjack contre le croupier',
  usage: 'bj <montant|all>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const bet = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    if (!bet) return usage(message, this);
    if (bet > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -bet); // la mise est retirée tout de suite
    const deck = buildDeck();
    const player = [deck.pop(), deck.pop()];
    const dealer = [deck.pop(), deck.pop()];

    const finish = async (sent, status) => {
      let gain = 0;
      if (status.win) gain = bet * winMultiplier(acc);
      else if (status.push) gain = bet;
      if (gain) addWallet(guild.id, author.id, gain);
      await sent.edit({ embeds: [buildEmbed({ player, dealer, hideDealer: false, bet, status })], components: [buildRow(true)] });
    };

    // Blackjack naturel
    if (blackjackValue(player) === 21) {
      const sent = await message.reply({ embeds: [buildEmbed({ player, dealer, hideDealer: false, bet })], allowedMentions: { repliedUser: false } });
      const dealerBJ = blackjackValue(dealer) === 21;
      return finish(sent, dealerBJ
        ? { push: true, text: '🤝 Égalité (blackjack des deux côtés), mise rendue.' }
        : { win: true, text: `🂡 Blackjack ! Tu gagnes **${money(bet * winMultiplier(acc))}**.` });
    }

    const sent = await message.reply({
      embeds: [buildEmbed({ player, dealer, hideDealer: true, bet })],
      components: [buildRow()],
      allowedMentions: { repliedUser: false },
    });

    const collector = sent.createMessageComponentCollector({ time: 60_000 });
    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== author.id) {
        return interaction.reply({ content: '❌ Ce n’est pas ta partie.', ephemeral: true });
      }

      if (interaction.customId === 'bj_hit') {
        player.push(deck.pop());
        const value = blackjackValue(player);
        if (value > 21) {
          collector.stop();
          await interaction.update({ embeds: [buildEmbed({ player, dealer, hideDealer: false, bet })], components: [buildRow(true)] });
          return finish(sent, { lose: true, text: `💥 Bust ! Tu perds **${money(bet)}**.` });
        }
        return interaction.update({ embeds: [buildEmbed({ player, dealer, hideDealer: true, bet })], components: [buildRow()] });
      }

      if (interaction.customId === 'bj_stand') {
        collector.stop();
        while (blackjackValue(dealer) < 17) dealer.push(deck.pop());
        const p = blackjackValue(player);
        const d = blackjackValue(dealer);
        let status;
        if (d > 21 || p > d) status = { win: true, text: `✅ Tu gagnes **${money(bet * winMultiplier(acc))}**.` };
        else if (p === d) status = { push: true, text: '🤝 Égalité, mise rendue.' };
        else status = { lose: true, text: `❌ Le croupier gagne. Tu perds **${money(bet)}**.` };
        await interaction.update({ embeds: [buildEmbed({ player, dealer, hideDealer: false, bet })], components: [buildRow(true)] });
        return finish(sent, status);
      }
    });

    collector.on('end', (collected) => {
      if (!collected.size) sent.edit({ components: [buildRow(true)] }).catch(() => {});
    });
  },
};
