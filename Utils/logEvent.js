const { EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("../Database/services/guildSettingsService");

async function logEvent({ guild, title, description, color = "Grey" }) {
  const settings = await getGuildSettings(guild.id);

  if (!settings.logging?.enabled) return;
  if (!settings.logging.channelId) return;

  const channel = guild.channels.cache.get(settings.logging.channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { logEvent };
