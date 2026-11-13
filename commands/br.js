const { getAccount, addWallet, addBank } = require('../utils/economy');
const { reply, usage, COLORS, money, parseAmount } = require('../utils/helpers');

module.exports = {
  name: 'br',
  description: 'Retire de l’argent de la banque vers ton portefeuille',
  usage: 'br <montant|all>',
  category: 'casino',
  async execute(message, args) {
    const acc = getAccount(message.guild.id, message.author.id);
    const amount = args[0]?.toLowerCase() === 'all' ? acc.bank : parseAmount(args[0]);
    if (!amount) return usage(message, this);
    if (amount > acc.bank) return reply(message, '❌ Tu n’as pas assez à la banque.', COLORS.error);

    addBank(message.guild.id, message.author.id, -amount);
    const wallet = addWallet(message.guild.id, message.author.id, amount);
    return reply(message, `🏦 **${money(amount)}** retiré(s). Portefeuille : **${money(wallet)}**`, COLORS.success);
  },
};
