const { getAccount, addWallet, winMultiplier } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

const SYMBOLS = ['🍒', '🍋', '🍇', '⭐', '💎'];

module.exports = {
  name: 'sl',
  aliases: ['slot', 'slots'],
  description: 'Machine à sous : 3 symboles identiques pour gagner',
  usage: 'sl <montant|all>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const bet = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    if (!bet) return usage(message, this);
    if (bet > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -bet);
    const reels = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    const allSame = reels[0] === reels[1] && reels[1] === reels[2];
    const twoSame = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];

    let gain = 0;
    let text = `❌ Rien ce coup-ci, tu perds **${money(bet)}**.`;
    if (allSame) {
      gain = bet * winMultiplier(acc) * (reels[0] === '💎' ? 2 : 1);
      text = `🎉 Trois ${reels[0]} ! Tu gagnes **${money(gain)}** !`;
    } else if (twoSame) {
      gain = Math.round(bet * 0.5);
      text = `🙂 Deux symboles identiques, tu récupères **${money(gain)}**.`;
    }
    if (gain) addWallet(guild.id, author.id, gain);

    return reply(message, `🎰 [ ${reels.join(' | ')} ]\n\n${text}`, allSame ? COLORS.success : COLORS.main);
  },
};
