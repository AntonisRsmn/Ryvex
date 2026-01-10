const { EmbedBuilder } = require("discord.js");
const { getGuildSettings, updateGuildSettings } = require("../Database/services/guildSettingsService");

async function logEvent({
  guild,
  title,
  description,
  color = "Grey",
  type = "general", // "general" | "moderation"
}) {
  const settings = await getGuildSettings(guild.id);

  // 🔧 Auto-migrate moderation object (GLOBAL SAFETY NET)
  if (!settings.moderation) {
    await updateGuildSettings(guild.id, {
      "moderation.enabled": false,
      "moderation.channelId": null,
    });

    settings.moderation = {
      enabled: false,
      channelId: null,
    };
  }

  if (!settings.logging?.enabled) return;

  let channelId = settings.logging.channelId;

  // 🛡 moderation override with safe fallback
  if (
    type === "moderation" &&
    settings.moderation.enabled === true &&
    settings.moderation.channelId
  ) {
    channelId = settings.moderation.channelId;
  }

  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { logEvent };
