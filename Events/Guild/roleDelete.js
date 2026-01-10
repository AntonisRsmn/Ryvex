const { AuditLogEvent } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "roleDelete",

  async execute(role) {
    const guild = role.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);

    const enabled =
      settings.logging?.events?.roleDelete ?? true;

    if (!settings.logging?.enabled || !enabled) return;

    let moderator = "Unknown";

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.RoleDelete,
        limit: 1,
      });

      const entry = logs.entries.first();
      if (
        entry &&
        entry.target?.id === role.id &&
        Date.now() - entry.createdTimestamp < 5000
      ) {
        moderator = entry.executor?.tag ?? "Unknown";
      }
    } catch {}

    await logEvent({
      guild,
      title: "🗑 Role Deleted",
      description: [
        `**Role:** ${role.name}`,
        `**Moderator:** ${moderator}`,
      ].join("\n"),
      color: "Red",
    });
  },
};
