const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "messageBulkDelete",

  async execute(messages) {
    if (!messages.size) return;

    const channel = messages.first().channel;
    const guild = channel.guild;

    const settings = await getGuildSettings(guild.id);
    if (!settings.logging?.enabled) return;

    const showContent = Boolean(settings.logging.messageContent);

    const summary = messages.map(m => {
      const content =
        showContent && m.content
          ? m.content.slice(0, 200)
          : "*Hidden (privacy mode)*";

      return `• **${m.author?.tag ?? "Unknown"}:** ${content}`;
    });

    await logEvent({
      guild,
      type: "moderation",
      title: "🧹 Bulk Messages Deleted",
      description: [
        `**Channel:** ${channel}`,
        `**Messages Deleted:** ${messages.size}`,
        "",
        ...summary.slice(0, 15),
        messages.size > 15 ? `\n…and ${messages.size - 15} more.` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      color: "Red",
    });
  },
};
