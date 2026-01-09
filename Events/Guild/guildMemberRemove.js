const { AuditLogEvent } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const { logEvent } = require("../../Utils/logEvent");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const { guild, user } = member;
    const settings = await getGuildSettings(guild.id);

    /* ───────── DEFAULT-ON EVENT TOGGLE ───────── */
    const memberLeaveEnabled =
      settings.logging?.events?.memberLeave ?? true;

    if (!settings.logging?.enabled || !memberLeaveEnabled) return;

    /* ───────── AVOID DUPLICATES (kick / ban) ───────── */
    let wasModerated = false;

    try {
      // Check for kick
      const kickLogs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberKick,
        limit: 1,
      });

      const kickLog = kickLogs.entries.first();
      if (
        kickLog &&
        kickLog.target?.id === user.id &&
        Date.now() - kickLog.createdTimestamp < 5000
      ) {
        wasModerated = true;
      }

      // Check for ban
      const banLogs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 1,
      });

      const banLog = banLogs.entries.first();
      if (
        banLog &&
        banLog.target?.id === user.id &&
        Date.now() - banLog.createdTimestamp < 5000
      ) {
        wasModerated = true;
      }
    } catch (err) {
      console.error("Audit log check failed:", err.message);
    }

    // If kicked or banned → do NOT log as leave
    if (wasModerated) return;

    /* ───────── VOLUNTARY LEAVE LOG ───────── */
    await logEvent({
      guild,
      title: "👋 Member Left",
      description: `${user.tag} left the server.`,
      color: "Orange",
    });
  },
};
