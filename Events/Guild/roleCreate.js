const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "roleCreate",

  async execute(role) {
    const guild = role.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);
    const enabled = settings.logging?.events?.roleCreate ?? true;

    if (!settings.logging?.enabled || !enabled) return;

    /* ───────── MODERATOR DETECTION (SAFE) ───────── */
    let moderator = "Unknown";

    const me = guild.members.me;
    const canViewAuditLog =
      me && me.permissions.has(PermissionFlagsBits.ViewAuditLog);

    if (canViewAuditLog) {
      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.RoleCreate,
          limit: 1,
        });

        const entry = logs.entries.first();

        if (
          entry &&
          entry.target?.id === role.id &&
          Date.now() - entry.createdTimestamp < 5000
        ) {
          moderator = entry.executor?.bot
            ? "Bot / Integration"
            : entry.executor?.tag ?? "Unknown";
        }
      } catch {
        // audit logs are best-effort only
      }
    } else {
      moderator = "Bot / Integration";
    }

    /* ───────── LOG EVENT ───────── */
    await logEvent({
      guild,
      title: "🎭 Role Created",
      description: [
        `**Role:** ${role.name}`,
        `**Created by:** ${moderator}`,
      ].join("\n"),
      color: "Green",
      type: "general",
    });
  },
};
