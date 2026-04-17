const {
  ChannelType,
  AuditLogEvent,
  PermissionFlagsBits,
} = require("discord.js");

const { logEvent } = require("../../Utils/logEvent");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const { isSuppressed } = require("../../Utils/actionSuppressor"); // ✅ NEW

module.exports = {
  name: "channelUpdate",

  async execute(oldChannel, newChannel) {
    try {
    const guild = newChannel.guild;
    if (!guild) return;

    /* ───────── SUPPRESSION CHECK ───────── */
    if (isSuppressed(newChannel.id)) return; // ✅ FIX

    const settings = await getGuildSettings(guild.id);

    if (
      !settings.logging?.enabled ||
      settings.logging.events?.channelUpdate === false
    ) {
      return;
    }

    /* ───────── DETECT CHANGES ───────── */
    const changes = [];

    if (oldChannel.name !== newChannel.name) {
      changes.push(
        `**Name:** \`${oldChannel.name}\` → \`${newChannel.name}\``
      );
    }

    if (
      oldChannel.type === ChannelType.GuildText &&
      oldChannel.topic !== newChannel.topic
    ) {
      changes.push("**Topic updated**");
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
      changes.push(
        `**NSFW:** ${oldChannel.nsfw ? "Enabled" : "Disabled"} → ${
          newChannel.nsfw ? "Enabled" : "Disabled"
        }`
      );
    }

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
      changes.push("**Slowmode updated**");
    }

    if (
      oldChannel.permissionOverwrites.cache.size !==
      newChannel.permissionOverwrites.cache.size
    ) {
      changes.push("**Permissions updated**");
    }

    if (!changes.length) return;

    /* ───────── CHANNEL TYPE LABEL ───────── */
    let typeLabel = "Channel";

    switch (newChannel.type) {
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

    /* ───────── AUDIT LOG LOOKUP ───────── */
    let executor = "Unknown";
    const me = guild.members.me;

    if (me && me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.ChannelUpdate,
          limit: 1,
        });

        const entry = logs.entries.first();

        if (
          entry &&
          entry.target?.id === newChannel.id &&
          Date.now() - entry.createdTimestamp < 5000
        ) {
          executor = entry.executor?.tag ?? "Unknown";
        }
      } catch {
        executor = "Unknown";
      }
    } else {
      executor = "Bot / Integration";
    }

    /* ───────── GENERAL LOG ───────── */
    await logEvent({
      guild,
      title: `${typeLabel} Updated`,
      description: [
        `**Channel:** ${newChannel}`,
        `**Updated by:** ${executor}`,
        "",
        ...changes,
      ].join("\n"),
      color: "Yellow",
      type: "general",
    });
    } catch (err) {
      console.error("[channelUpdate]", err);
    }
  },
};
