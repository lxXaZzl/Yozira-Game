const { ITEMS } = require('../utils/shop');
const { getAccount, addWallet, setField } = require('../utils/economy');
const { reply, usage, COLORS, money } = require('../utils/helpers');

module.exports = {
  name: 'buy',
  aliases: ['acheter'],
  description: 'Achète un objet de la boutique',
  usage: 'buy <faucheur|vip>',
  category: 'casino',
  async execute(message, args) {
    const key = args[0]?.toLowerCase();
    const item = ITEMS[key];
    if (!item) return usage(message, this);

    const { guild, author } = message;
    const acc = getAccount(guild.id, author.id);
    if (item.effect === 'vip' && acc.vip) return reply(message, '❌ Tu as déjà le VIP.', COLORS.error);
    if (item.role === 'Faucheur' && acc.faucheur) return reply(message, '❌ Tu as déjà Faucheur.', COLORS.error);
    if (acc.wallet < item.price) return reply(message, `❌ Il te faut **${money(item.price)}**, tu as **${money(acc.wallet)}**.`, COLORS.error);

    addWallet(guild.id, author.id, -item.price);
    if (item.effect === 'vip') setField(guild.id, author.id, 'vip', 1);
    if (item.role === 'Faucheur') setField(guild.id, author.id, 'faucheur', 1);

    if (item.role) {
      let role = guild.roles.cache.find((r) => r.name === item.role);
      if (!role) role = await guild.roles.create({ name: item.role, reason: 'Objet de la boutique' }).catch(() => null);
      if (role) await message.member.roles.add(role).catch(() => {});
    }

    return reply(message, `✅ Tu as acheté **${item.label}** pour **${money(item.price)}** !`, COLORS.success);
  },
};
