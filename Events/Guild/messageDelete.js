const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;

    const settings = await getGuildSettings(message.guild.id);
    if (!settings.logging?.enabled) return;

    const enabled = settings.logging.events?.messageDelete ?? true;
    if (!enabled) return;

    /* ───────── FETCH PARTIAL MESSAGE ───────── */
    if (message.partial) {
      try {
        await message.fetch();
      } catch {
        // message may no longer exist — continue safely
      }
    }

    // Ignore bot-authored messages
    if (message.author?.bot) return;

    /* ───────── DELETED BY DETECTION (SAFE) ───────── */
    let deletedBy = "Self / Unconfirmed";

    const me = message.guild.members.me;
    const canViewAuditLog =
      me && me.permissions.has(PermissionFlagsBits.ViewAuditLog);

    if (canViewAuditLog) {
      try {
        const logs = await message.guild.fetchAuditLogs({
          type: AuditLogEvent.MessageDelete,
          limit: 6,
        });

        const entry = logs.entries.find(
          e =>
            e.target?.id === message.author?.id &&
            Date.now() - e.createdTimestamp < 5000
        );

        if (entry?.executor) {
          deletedBy = entry.executor.bot
            ? "Bot / Integration"
            : `Moderator (${entry.executor.tag})`;
        }
      } catch {
        // audit logs are best-effort only
      }
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
      type: "general",
    });
  },
};
