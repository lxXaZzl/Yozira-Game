const { getAccount, addWallet, addBank } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');

module.exports = {
  name: 'bd',
  description: 'Met de l’argent de ton portefeuille à la banque (à l’abri d’un vol)',
  usage: 'bd <montant|all>',
  category: 'casino',
  async execute(message, args) {
    const acc = getAccount(message.guild.id, message.author.id);
    const amount = args[0]?.toLowerCase() === 'all' ? acc.wallet : parseAmount(args[0]);
    if (!amount) return usage(message, this);
    if (amount > acc.wallet) return reply(message, '❌ Tu n’as pas assez dans ton portefeuille.', COLORS.error);

    addWallet(message.guild.id, message.author.id, -amount);
    const bank = addBank(message.guild.id, message.author.id, amount);
    return reply(message, `🏦 **${money(amount)}** déposé(s). Banque : **${money(bank)}**`, COLORS.success);
  },
};
