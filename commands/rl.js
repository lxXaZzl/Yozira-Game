const { getAccount, addWallet, winMultiplier } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

// Roulette simplifiée : rouge/noir (0 = vert, la banque gagne)
module.exports = {
  name: 'rl',
  aliases: ['roulette'],
  description: 'Roulette : mise sur rouge ou noir',
  usage: 'rl <montant|all> <rouge|noir>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const bet = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    const choice = args[1]?.toLowerCase();
    if (!bet || !['rouge', 'noir'].includes(choice)) return usage(message, this);
    if (bet > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -bet);
    const number = Math.floor(Math.random() * 37); // 0 à 36
    const color = number === 0 ? 'vert' : number % 2 === 0 ? 'noir' : 'rouge';
    const win = color === choice;
    const gain = win ? bet * winMultiplier(acc) : 0;
    if (gain) addWallet(guild.id, author.id, gain);

    const text = win
      ? `✅ **${number} (${color})** ! Tu gagnes **${money(gain)}**.`
      : `❌ **${number} (${color})**. Tu perds **${money(bet)}**.`;
    return reply(message, `🎡 ${text}`, win ? COLORS.success : COLORS.error);
  },
};
