require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.prefix = process.env.PREFIX || '-';
client.commands = new Collection();

function load(dir, handler) {
  const folder = path.join(__dirname, dir);
  for (const file of fs.readdirSync(folder).filter((f) => f.endsWith('.js'))) {
    handler(require(path.join(folder, file)));
  }
}

load('commands', (cmd) => {
  client.commands.set(cmd.name, cmd);
  for (const alias of cmd.aliases || []) client.commands.set(alias, cmd);
});

load('events', (mod) => {
  for (const event of [].concat(mod)) {
    client.on(event.name, async (...args) => {
      try {
        await event.execute(...args, client);
      } catch (err) {
        console.error(`[${event.name}]`, err);
      }
    });
  }
});

process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));

client.login(process.env.TOKEN);
