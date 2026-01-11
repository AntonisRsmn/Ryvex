const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "roleUpdate",

  async execute(oldRole, newRole) {
    const guild = newRole.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);
    const enabled = settings.logging?.events?.roleUpdate ?? true;

    if (!settings.logging?.enabled || !enabled) return;

    /* ───────── DETECT CHANGES ───────── */
    const changes = [];

    if (oldRole.name !== newRole.name) {
      changes.push(`**Name:** ${oldRole.name} → ${newRole.name}`);
    }

    if (oldRole.color !== newRole.color) {
      changes.push("**Color changed**");
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      changes.push("**Permissions changed**");
    }

    if (!changes.length) return;

    /* ───────── MODERATOR DETECTION (SAFE) ───────── */
    let moderator = "Unknown";

    const me = guild.members.me;
    const canViewAuditLog =
      me && me.permissions.has(PermissionFlagsBits.ViewAuditLog);

    if (canViewAuditLog) {
      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.RoleUpdate,
          limit: 1,
        });

        const entry = logs.entries.first();

        if (
          entry &&
          entry.target?.id === newRole.id &&
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
      title: "✏️ Role Updated",
      description: [
        `**Role:** ${newRole.name}`,
        `**Updated by:** ${moderator}`,
        "",
        ...changes,
      ].join("\n"),
      color: "Yellow",
      type: "general",
    });
  },
};
