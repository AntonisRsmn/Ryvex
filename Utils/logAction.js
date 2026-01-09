const { EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("../Database/services/guildSettingsService");

async function logAction({
  guild,
  action,
  target,
  moderator,
  reason = "No reason provided",
}) {
  try {
    const settings = await getGuildSettings(guild.id);

    if (!settings.logging.enabled) return;
    if (!settings.logging.channelId) return;

    const channel = guild.channels.cache.get(settings.logging.channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("🛡 Moderation Log")
      .setColor("White")
      .addFields(
        { name: "Action", value: action, inline: true },
        { name: "Target", value: `${target}`, inline: true },
        { name: "Moderator", value: `${moderator}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Logging failed:", error.message);
  }
}

module.exports = { logAction };
