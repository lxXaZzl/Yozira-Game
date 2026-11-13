const { getAccount, addWallet, setField } = require('../utils/economy');
const { reply, usage, extractId, fetchMember, COLORS, money } = require('../utils/helpers');
const { requireCasino } = require('../utils/casino');

const COOLDOWN_MS = 45 * 60 * 1000;
const SUCCESS_RATE = 0.4;
const MIN_TARGET_WALLET = 200;

module.exports = {
  name: 'rob',
  aliases: ['vol'],
  description: 'Tente de voler de l’argent dans le portefeuille de quelqu’un',
  usage: 'rob @user',
  category: 'casino',
  async execute(message, args) {
    if (!requireCasino(message)) return;
    const { guild, author } = message;
    const targetId = extractId(args[0]);
    if (!targetId || targetId === author.id) return usage(message, this);

    const target = await fetchMember(guild, targetId);
    if (!target) return reply(message, '❌ Membre introuvable.', COLORS.error);

    const me = getAccount(guild.id, author.id);
    const wait = COOLDOWN_MS - (Date.now() - me.last_rob);
    if (wait > 0) return reply(message, `⏳ Attends encore **${Math.ceil(wait / 60000)} min** avant un nouveau vol.`, COLORS.error);

    const victim = getAccount(guild.id, targetId);
    if (victim.wallet < MIN_TARGET_WALLET) {
      return reply(message, `❌ Cette personne n'a pas assez sur elle (minimum ${money(MIN_TARGET_WALLET)}).`, COLORS.error);
    }

    setField(guild.id, author.id, 'last_rob', Date.now());
    const success = Math.random() < SUCCESS_RATE;

    if (success) {
      const stolen = Math.round(victim.wallet * (0.1 + Math.random() * 0.3));
      addWallet(guild.id, targetId, -stolen);
      addWallet(guild.id, author.id, stolen);
      return reply(message, `🕵️ Vol réussi ! Tu as volé **${money(stolen)}** à ${target}.`, COLORS.success);
    }

    const fine = Math.round(me.wallet * 0.15);
    if (fine) addWallet(guild.id, author.id, -fine);
    return reply(message, `🚨 Tu t'es fait choper ! Amende de **${money(fine)}**.`, COLORS.error);
  },
};
