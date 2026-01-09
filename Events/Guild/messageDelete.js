const { AuditLogEvent } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;

    const settings = await getGuildSettings(message.guild.id);

    const messageDeleteEnabled =
      settings.logging?.events?.messageDelete ?? true;

    if (!settings.logging?.enabled || !messageDeleteEnabled) return;

    // Fetch partial if needed
    if (message.partial) {
      try {
        await message.fetch();
      } catch {
        // Still log without content
      }
    }

    // Ignore bot messages
    if (message.author?.bot) return;

    /* ───────── DELETER DETECTION (BEST-EFFORT) ───────── */
    let deletedBy = "Unknown / Self";

    try {
      const logs = await message.guild.fetchAuditLogs({
        type: AuditLogEvent.MessageDelete,
        limit: 1,
      });

      const entry = logs.entries.first();

      if (
        entry &&
        entry.executor &&
        Date.now() - entry.createdTimestamp < 3000
      ) {
        deletedBy = `Moderator (${entry.executor.tag})`;
      }
    } catch {
      // Ignore audit log failures
    }

    /* ───────── PRIVACY MODE ───────── */
    const showContent = Boolean(settings.logging?.messageContent);

    const content =
      showContent && message.content
        ? message.content.slice(0, 1000)
        : "*Hidden (privacy mode)*";

    /* ───────── LOG EVENT ───────── */
    await logEvent({
      guild: message.guild,
      title: "🗑 Message Deleted",
      description: [
        `**Author:** ${message.author?.tag ?? "Unknown"}`,
        `**Channel:** ${message.channel}`,
        `**Deleted By:** ${deletedBy}`,
        `**Content:** ${content}`,
      ].join("\n"),
      color: "Red",
    });
  },
};
