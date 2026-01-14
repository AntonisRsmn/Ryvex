const { EmbedBuilder } = require("discord.js");
const {
  getGuildSettings,
  updateGuildSettings,
} = require("../Database/services/guildSettingsService");

async function logEvent({
  guild,
  title,
  description,
  color = "Grey",
  type = "general",
  components = [],
}) {
  const settings = await getGuildSettings(guild.id);

  // Safety backfill
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
    .setFooter({
      text:
        type === "moderation"
          ? "Ryvex • Moderation Logs"
          : "Ryvex • General Logs",
    })
    .setTimestamp();

  channel.send({
    embeds: [embed],
    components,
  }).catch(() => {});
}

module.exports = { logEvent };
