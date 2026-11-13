const { getAccount, addWallet, setField } = require('../utils/economy');
const { reply, COLORS, money } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

const AMOUNT = 1000;

// Reset à minuit UTC
function msUntilNextMidnightUTC() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

module.exports = {
  name: 'daily',
  description: 'Récupère 1000¥ une fois par jour (reset à minuit)',
  usage: 'daily',
  category: 'casino',
  async execute(message) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);

    const now = Date.now();
    const today = new Date(now).toISOString().slice(0, 10);
    const lastDay = acc.last_daily ? new Date(acc.last_daily).toISOString().slice(0, 10) : null;
    if (lastDay === today) {
      return reply(message, `⏰ Tu as déjà récupéré ta prime aujourd'hui. Reviens dans **${formatMs(msUntilNextMidnightUTC())}**.`, COLORS.error);
    }

    setField(guild.id, author.id, 'last_daily', now);
    const wallet = addWallet(guild.id, author.id, AMOUNT);
    return reply(message, `✅ Tu as récupéré ta prime quotidienne de **${money(AMOUNT)}** !\nPortefeuille : **${money(wallet)}**`, COLORS.success);
  },
};

function formatMs(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}min`;
}
