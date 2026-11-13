const { addWallet, getAccount, setField } = require('../utils/economy');
const { reply, COLORS, money } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

const COOLDOWN_MS = 30 * 60 * 1000;
const MESSAGES = [
  'Tu as serveur des cocktails au bar du casino',
  'Tu as surveillé les caméras du casino',
  "Tu as distribué les cartes à une table de poker",
  'Tu as nettoyé les machines à sous',
];

module.exports = {
  name: 'work',
  aliases: ['travail'],
  description: 'Un petit boulot au casino, toutes les 30 minutes',
  usage: 'work',
  category: 'casino',
  async execute(message) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    const wait = COOLDOWN_MS - (Date.now() - acc.last_work);
    if (wait > 0) return reply(message, `⏳ Attends encore **${Math.ceil(wait / 60000)} min**.`, COLORS.error);

    const gain = 100 + Math.floor(Math.random() * 200);
    setField(guild.id, author.id, 'last_work', Date.now());
    const wallet = addWallet(guild.id, author.id, gain);
    const flavor = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    return reply(message, `💼 ${flavor} et gagné **${money(gain)}**.\nPortefeuille : **${money(wallet)}**`, COLORS.success);
  },
};
