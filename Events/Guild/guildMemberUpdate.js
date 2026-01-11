const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");
const {
  isSuppressed,
} = require("../../Utils/memberUpdateSuppressor");

module.exports = {
  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {
    const guild = newMember.guild;
    if (!guild) return;

    // 🔒 HARD STOP — already logged by command
    if (isSuppressed(guild.id, newMember.id)) return;

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
    const nicknameChanged = oldMember.nickname !== newMember.nickname;
    if (nicknameChanged) {
      changes.push(
        `**Nickname:** ${oldMember.nickname ?? "None"} → ${newMember.nickname ?? "None"}`
      );
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
          type: AuditLogEvent.MemberUpdate,
          limit: 6,
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
      } catch {
        // audit logs are best-effort only
      }
    }

    /* ───────── FALLBACKS ───────── */
    if (moderator === "Unknown") {
      if (nicknameChanged) {
        moderator = `${newMember.user.tag} (self)`;
      } else if (addedRoles.size || removedRoles.size) {
        moderator = "Bot / Integration";
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
      type: "general",
    });
  },
};
