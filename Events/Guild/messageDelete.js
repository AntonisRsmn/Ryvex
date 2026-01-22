const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");
const {
  shouldSuppressDelete,
} = require("../../Utils/messageDeleteSuppressor");
const { isSuppressed } = require("../../Utils/automodChecks/suppressDelete");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;

    // 🔕 Suppress deletes caused by /clear (count-based)
    if (shouldSuppressDelete(message.guild.id)) {
      return;
    }

    const settings = await getGuildSettings(message.guild.id);
    if (!settings.logging?.enabled) return;

    const enabled = settings.logging.events?.messageDelete ?? true;
    if (!enabled) return;

    if (isSuppressed(message.id)) return;

    // Fetch partials safely
    if (message.partial) {
      try {
        await message.fetch();
      } catch {
        return;
      }
    }

    if (message.author?.bot) return;

    let deletedBy = "Self / Unconfirmed";

    // 🔍 Audit log lookup (safe, permission-gated)
    const me = message.guild.members.me;
    if (me?.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
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
        // Best-effort only
      }
    }

    // 🔒 Privacy-aware content handling
    const showContent = Boolean(settings.logging.messageContent);
    const content =
      showContent && message.content
        ? message.content.slice(0, 1000)
        : "*Hidden (privacy mode)*";

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
