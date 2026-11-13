const { topWallet } = require('../utils/economy');
const { reply, money } = require('../utils/helpers');

module.exports = {
  name: 'lb',
  aliases: ['leaderboard', 'classement'],
  description: 'Classement des plus riches du serveur',
  usage: 'lb',
  category: 'casino',
  async execute(message) {
    const top = topWallet(message.guild.id, 10);
    if (!top.length) return reply(message, '❌ Personne n’a encore d’argent sur ce serveur.');

    const medals = ['🥇', '🥈', '🥉'];
    const lines = top.map((r, i) => `${medals[i] || `**${i + 1}.**`} <@${r.user_id}> · ${money(r.wallet + r.bank)}`);
    return reply(message, `🏆 **Classement Yozira**\n\n${lines.join('\n')}`);
  },
};
