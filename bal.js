const { getAccount } = require('../utils/economy');
const { reply, extractId, money } = require('../utils/helpers');

module.exports = {
  name: 'bal',
  aliases: ['solde', 'balance'],
  description: 'Solde (portefeuille + banque)',
  usage: 'bal [@user]',
  category: 'casino',
  async execute(message, args) {
    const id = extractId(args[0]) || message.author.id;
    const acc = getAccount(message.guild.id, id);
    const extras = [acc.vip ? '💎 VIP (x4 sur les jeux)' : null, acc.faucheur ? '💀 Faucheur' : null].filter(Boolean);
    return reply(
      message,
      `💰 <@${id}>\nPortefeuille : **${money(acc.wallet)}**\nBanque : **${money(acc.bank)}**` +
        (extras.length ? `\n\n${extras.join(' · ')}` : '')
    );
  },
};
