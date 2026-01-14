const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "messageUpdate",

  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild) return;

    // ───────── FETCH PARTIALS ─────────
    if (oldMessage.partial) {
      try {
        await oldMessage.fetch();
      } catch {
        return;
      }
    }

    if (newMessage.partial) {
      try {
        await newMessage.fetch();
      } catch {
        return;
      }
    }

    // Ignore bot messages
    if (oldMessage.author?.bot) return;

    // Ignore no-op edits
    if (oldMessage.content === newMessage.content) return;

    const settings = await getGuildSettings(oldMessage.guild.id);

    const enabled = settings.logging?.events?.messageEdit ?? true;
    if (!settings.logging?.enabled || !enabled) return;

    const showContent = settings.logging.messageContent === true;

    // ───────── AUTHOR SAFE RESOLUTION ─────────
    let authorLabel = "Unknown User";

    if (oldMessage.author) {
      authorLabel = `${oldMessage.author.tag}`;
    } else if (oldMessage.webhookId) {
      authorLabel = "Webhook";
    }

    // ───────── CONTENT HANDLING ─────────
    const before =
      showContent && oldMessage.content?.length
        ? oldMessage.content
        : "*Hidden (privacy mode)*";

    const after =
      showContent && newMessage.content?.length
        ? newMessage.content
        : "*Hidden (privacy mode)*";

    // ───────── LOG EVENT ─────────
    await logEvent({
      guild: oldMessage.guild,
      title: "✏️ Message Edited",
      description: [
        `**Author:** ${authorLabel}`,
        `**Channel:** ${oldMessage.channel}`,
        `**Before:** ${before}`,
        `**After:** ${after}`,
        `**Message Link:** [Jump](${newMessage.url})`,
      ].join("\n"),
      color: "Yellow",
    });
  },
};
