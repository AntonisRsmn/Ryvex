const { ChannelType, AuditLogEvent } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "channelDelete",

  async execute(channel) {
    const guild = channel.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);

    // Allow unless explicitly disabled
    if (
      !settings.logging?.enabled ||
      settings.logging.events?.channelDelete === false
    ) {
      return;
    }

    // ───────── CHANNEL TYPE LABEL ─────────
    let typeLabel = "Channel";

    switch (channel.type) {
      case ChannelType.GuildText:
        typeLabel = "📝 Text Channel";
        break;
      case ChannelType.GuildVoice:
        typeLabel = "🔊 Voice Channel";
        break;
      case ChannelType.GuildAnnouncement:
        typeLabel = "📢 Announcement Channel";
        break;
      case ChannelType.GuildForum:
        typeLabel = "🧵 Forum Channel";
        break;
      case ChannelType.GuildCategory:
        typeLabel = "📁 Category";
        break;
    }

    // ───────── AUDIT LOG LOOKUP ─────────
    let executor = "Unknown";

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelDelete,
        limit: 1,
      });

      const entry = logs.entries.first();

      if (
        entry &&
        entry.target?.id === channel.id &&
        Date.now() - entry.createdTimestamp < 5000
      ) {
        executor = `${entry.executor.tag}`;
      }
    } catch (error) {
      console.error("ChannelDelete audit log fetch failed:", error.message);
    }

    // ───────── LOG EVENT ─────────
    await logEvent({
      guild,
      title: `${typeLabel} Deleted`,
      description: [
        `**Name:** ${channel.name}`,
        `**Deleted by:** ${executor}`,
      ].join("\n"),
      color: "Red",
    });
  },
};
