// Events/Client/birthdayAnnounce.js
const { Events, EmbedBuilder } = require('discord.js');
const { getConfig, getBirthday, getRandomBirthdayMessage } = require('../../Utils/birthdayUtils');

module.exports = {
  name: 'birthdayAnnounce',
  once: false,
  async execute(client) {
    // Run once per day at 00:05 server time
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() !== 0 || now.getMinutes() < 5 || now.getMinutes() > 10) return;
      for (const guild of client.guilds.cache.values()) {
        const config = getConfig(guild.id);
        if (!config.enabled || !config.channel) continue;
        const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const birthdays = getBirthday(null, guild.id, mmdd);
        if (birthdays && birthdays.length) {
          const channel = guild.channels.cache.get(config.channel);
          if (!channel) continue;
          for (const user of birthdays) {
            const member = await guild.members.fetch(user.userId).catch(() => null);
            const username = member ? `<@${member.id}>` : 'Someone';
            let msg;
            if (config.message) {
              msg = config.message.replace(/<username>/g, username);
            } else {
              msg = getRandomBirthdayMessage(username);
            }
            const embed = new EmbedBuilder()
              .setTitle('🎂 Happy Birthday!')
              .setDescription(msg)
              .setColor(0xF5B041)
              .setThumbnail(member?.user.displayAvatarURL?.() || null)
              .setFooter({ text: 'Ryvex • Birthday' })
              .setTimestamp();
            await channel.send({ embeds: [embed] });
          }
        }
      }
    }, 60 * 1000); // check every minute
  }
};
