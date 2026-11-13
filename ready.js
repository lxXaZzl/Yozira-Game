module.exports = {
  name: 'ready',
  async execute(client) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    client.user.setPresence({ status: 'dnd', activities: [{ name: '🎰 -help' }] });
  },
};
