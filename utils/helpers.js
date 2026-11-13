const { EmbedBuilder } = require('discord.js');

const CURRENCY = '¥';
const COLORS = { main: 0xffb7d5, success: 0x9be3a8, error: 0xff7b7b, gold: 0xf5c518 };

function reply(message, text, color = COLORS.main) {
  const embed = new EmbedBuilder().setColor(color).setDescription(text);
  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

function usage(message, command) {
  return reply(message, `❌ Utilisation : \`${message.client.prefix}${command.usage}\``, COLORS.error);
}

function extractId(input) {
  if (!input) return null;
  const m = /^<@!?(\d{15,25})>$|^(\d{15,25})$/.exec(input);
  return m ? m[1] || m[2] : null;
}

function fetchMember(guild, id) {
  return guild.members.fetch(id).catch(() => null);
}

// "1500" -> 1500, "1.5k" -> 1500, "2m" -> 2000000
function parseAmount(input) {
  if (!input) return null;
  const m = /^(\d+(?:\.\d+)?)(k|m)?$/i.exec(input.replace(/[,\s]/g, ''));
  if (!m) return null;
  const mult = { k: 1_000, m: 1_000_000 }[m[2]?.toLowerCase()] || 1;
  const value = Math.round(parseFloat(m[1]) * mult);
  return value > 0 ? value : null;
}

const money = (n) => `${Math.trunc(n).toLocaleString('fr-FR')}${CURRENCY}`;

module.exports = { CURRENCY, COLORS, reply, usage, extractId, fetchMember, parseAmount, money };
