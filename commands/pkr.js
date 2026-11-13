const { EmbedBuilder } = require('discord.js');
const { getAccount, addWallet, winMultiplier } = require('../utils/economy');
const { buildDeck, fmtHand, compareHands, evaluateHand, HAND_NAMES } = require('../utils/cards');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

module.exports = {
  name: 'pkr',
  aliases: ['poker'],
  description: 'Poker simplifié : ta main à 5 cartes contre celle de la table',
  usage: 'pkr <montant|all>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const bet = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    if (!bet) return usage(message, this);
    if (bet > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -bet);
    const deck = buildDeck();
    const player = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
    const table = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];

    const cmp = compareHands(player, table);
    let status, gain = 0;
    if (cmp > 0) {
      gain = bet * winMultiplier(acc);
      status = `✅ Tu gagnes **${money(gain)}** !`;
    } else if (cmp === 0) {
      gain = bet;
      status = '🤝 Égalité, mise rendue.';
    } else {
      status = `❌ La table gagne. Tu perds **${money(bet)}**.`;
    }
    if (gain) addWallet(guild.id, author.id, gain);

    const embed = new EmbedBuilder()
      .setColor(cmp > 0 ? COLORS.success : cmp === 0 ? COLORS.main : COLORS.error)
      .setTitle('🎴 Poker')
      .setDescription(
        `Mise : **${money(bet)}**\n\n` +
          `**Ta main** (${HAND_NAMES[evaluateHand(player).category]})\n${fmtHand(player)}\n\n` +
          `**Table** (${HAND_NAMES[evaluateHand(table).category]})\n${fmtHand(table)}\n\n${status}`
      );
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
