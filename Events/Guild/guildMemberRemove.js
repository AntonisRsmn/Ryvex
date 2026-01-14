const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const { logEvent } = require("../../Utils/logEvent");
const {
  isMemberRemoveSuppressed,
} = require("../../Utils/memberRemoveSuppressor");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const { guild, user } = member;
    if (!guild) return;

    // 🚫 SUPPRESSION CHECK (COMMAND-BASED KICK / BAN)
    if (isMemberRemoveSuppressed(guild.id, user.id)) {
      return;
    }

    const settings = await getGuildSettings(guild.id);
    const memberLeaveEnabled =
      settings.logging?.events?.memberLeave ?? true;

    if (!settings.logging?.enabled || !memberLeaveEnabled) return;

    let action = "Left the server";
    let actor = "Self";
    let color = "Orange";

    const me = guild.members.me;
    const canViewAuditLog =
      me && me.permissions.has(PermissionFlagsBits.ViewAuditLog);

    if (canViewAuditLog) {
      try {
        const logs = await guild.fetchAuditLogs({ limit: 5 });

        const entry = logs.entries.find(
          e =>
            e.target?.id === user.id &&
            Date.now() - e.createdTimestamp < 5000 &&
            (
              e.action === AuditLogEvent.MemberKick ||
              e.action === AuditLogEvent.MemberBanAdd
            )
        );

        if (entry) {
          if (entry.action === AuditLogEvent.MemberKick) {
            action = "Kicked from the server";
            color = "Red";
          }

          if (entry.action === AuditLogEvent.MemberBanAdd) {
            action = "Banned from the server";
            color = "Red";
          }

          actor = entry.executor?.bot
            ? "Bot / Integration"
            : entry.executor?.tag ?? "Unknown";
        }
      } catch {
        // silent
      }
    }

    await logEvent({
      guild,
      title: "🚪 Member Left",
      description: [
        `**Member:** ${user.tag}`,
        `**Action:** ${action}`,
        `**By:** ${actor}`,
      ].join("\n"),
      color,
      type: "general",
    });
  },
};
