const { PermissionFlagsBits: P } = require('discord.js');
const { addWallet } = require('../utils/economy');
const { reply, usage, extractId, fetchMember, COLORS, money, parseAmount } = require('../utils/helpers');

module.exports = {
  name: 'd£l',
  aliases: ['dell'],
  description: 'Retire de l’argent à quelqu’un (admin)',
  usage: 'd£l <montant> <@user>',
  category: 'admin',
  permissions: [P.ManageGuild],
  async execute(message, args) {
    const amount = parseAmount(args[0]);
    const id = extractId(args[1]);
    if (!amount || !id) return usage(message, this);

    const member = await fetchMember(message.guild, id);
    if (!member) return reply(message, '❌ Membre introuvable.', COLORS.error);

    const wallet = addWallet(message.guild.id, id, -amount);
    return reply(message, `✅ **${money(amount)}** retiré(s) à ${member}. Nouveau solde : **${money(wallet)}**.`, COLORS.success);
  },
};
