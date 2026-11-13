const { getAccount, addWallet, winMultiplier } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

module.exports = {
  name: 'cf',
  aliases: ['coinflip', 'pf'],
  description: 'Pile ou face',
  usage: 'cf <montant|all> <pile|face>',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const bet = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    const choice = args[1]?.toLowerCase();
    if (!bet || !['pile', 'face'].includes(choice)) return usage(message, this);
    if (bet > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(guild.id, author.id, -bet);
    const result = Math.random() < 0.5 ? 'pile' : 'face';
    const win = result === choice;
    const gain = win ? bet * winMultiplier(acc) : 0;
    if (gain) addWallet(guild.id, author.id, gain);

    const text = win ? `✅ **${result}** ! Tu gagnes **${money(gain)}**.` : `❌ C'était **${result}**. Tu perds **${money(bet)}**.`;
    return reply(message, `🪙 ${text}`, win ? COLORS.success : COLORS.error);
  },
};
