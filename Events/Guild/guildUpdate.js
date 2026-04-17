const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "guildUpdate",

  async execute(oldGuild, newGuild) {
    try {
    const settings = await getGuildSettings(newGuild.id);

    const enabled = settings.logging?.events?.guildUpdate ?? true;
    if (!settings.logging?.enabled || !enabled) return;

    const changes = [];

    /* ───────── NAME CHANGE ───────── */
    if (oldGuild.name !== newGuild.name) {
      changes.push(`**Name:** ${oldGuild.name} → ${newGuild.name}`);
    }

    /* ───────── ICON CHANGE ───────── */
    if (oldGuild.icon !== newGuild.icon) {
      changes.push("**Icon:** Updated");
    }

    /* ───────── DESCRIPTION CHANGE ───────── */
    if (oldGuild.description !== newGuild.description) {
      changes.push(
        `**Description:** ${oldGuild.description ?? "None"} → ${newGuild.description ?? "None"}`
      );
    }

    /* ───────── VERIFICATION LEVEL ───────── */
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      changes.push(
        `**Verification Level:** ${oldGuild.verificationLevel} → ${newGuild.verificationLevel}`
      );
    }

    /* ───────── AFK SETTINGS ───────── */
    if (oldGuild.afkChannelId !== newGuild.afkChannelId) {
      const oldAfk = oldGuild.afkChannelId
        ? `<#${oldGuild.afkChannelId}>`
        : "None";

      const newAfk = newGuild.afkChannelId
        ? `<#${newGuild.afkChannelId}>`
        : "None";

      changes.push(`**AFK Channel:** ${oldAfk} → ${newAfk}`);
    }

    if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
      changes.push(
        `**AFK Timeout:** ${oldGuild.afkTimeout}s → ${newGuild.afkTimeout}s`
      );
    }

    // No meaningful changes → do nothing
    if (!changes.length) return;

    /* ───────── MODERATOR DETECTION (SAFE) ───────── */
    let moderator = "Unknown";

    const me = newGuild.members.me;
    const canViewAuditLog =
      me && me.permissions.has(PermissionFlagsBits.ViewAuditLog);

    if (canViewAuditLog) {
      try {
        const logs = await newGuild.fetchAuditLogs({
          type: AuditLogEvent.GuildUpdate,
          limit: 1,
        });

        const entry = logs.entries.first();

        if (
          entry &&
          Date.now() - entry.createdTimestamp < 5000
        ) {
          moderator = entry.executor?.bot
            ? "Bot / Integration"
            : entry.executor?.tag ?? "Unknown";
        }
      } catch {
        // audit logs are best-effort
      }
    } else {
      moderator = "Bot / Integration";
    }

    /* ───────── LOG EVENT ───────── */
    await logEvent({
      guild: newGuild,
      title: "🏛 Server Updated",
      description: [
        `**Moderator:** ${moderator}`,
        "",
        ...changes,
      ].join("\n"),
      color: "Blue",
      type: "general",
    });
    } catch (err) {
      console.error("[guildUpdate]", err);
    }
  },
};
