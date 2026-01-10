const { AuditLogEvent } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {
    const guild = newMember.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);
    const enabled = settings.logging?.events?.memberUpdate ?? true;

    if (!settings.logging?.enabled || !enabled) return;

    const changes = [];

    /* ───────── ROLE CHANGES ───────── */
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
    const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

    if (addedRoles.size) {
      changes.push(
        `**Roles Added:** ${addedRoles.map(r => r.name).join(", ")}`
      );
    }

    if (removedRoles.size) {
      changes.push(
        `**Roles Removed:** ${removedRoles.map(r => r.name).join(", ")}`
      );
    }

    /* ───────── NICKNAME CHANGE ───────── */
    if (oldMember.nickname !== newMember.nickname) {
      changes.push(
        `**Nickname:** ${oldMember.nickname ?? "None"} → ${newMember.nickname ?? "None"}`
      );
    }

    // Nothing meaningful changed
    if (!changes.length) return;

    /* ───────── MODERATOR DETECTION ───────── */
    let moderator = null;

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberUpdate,
        limit: 5,
      });

      const entry = logs.entries.find(
        e =>
          e.target?.id === newMember.id &&
          Date.now() - e.createdTimestamp < 8000
      );

      if (entry?.executor) {
        moderator = entry.executor.bot
          ? "Bot / Integration"
          : entry.executor.tag;
      }

      // 🚫 PREVENT DUPLICATES:
      // If role change AND audit executor exists,
      // it was already logged by a mod command → STOP
      if ((addedRoles.size || removedRoles.size) && entry?.executor) {
        return;
      }
    } catch {
      // ignore audit failures safely
    }

    /* ───────── FALLBACK LOGIC ───────── */
    if (!moderator) {
      // Self nickname change
      if (oldMember.nickname !== newMember.nickname) {
        moderator = `${newMember.user.tag} (self)`;
      }
      // Automated role changes (join roles, bots, integrations)
      else if (addedRoles.size || removedRoles.size) {
        moderator = "Bot / Integration";
      }
      // Last-resort fallback
      else {
        moderator = "Unknown";
      }
    }

    /* ───────── LOG EVENT ───────── */
    await logEvent({
      guild,
      title: "👤 Member Updated",
      description: [
        `**Member:** ${newMember.user.tag}`,
        `**Moderator:** ${moderator}`,
        "",
        ...changes,
      ].join("\n"),
      color: "Blue",
      type: "general", // 👈 stays GENERAL (not moderation)
    });
  },
};
