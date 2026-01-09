const { logEvent } = require("../../Utils/logEvent");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "messageUpdate",

  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild) return;

    // Fetch partials
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

    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const settings = await getGuildSettings(oldMessage.guild.id);

    const enabled = settings.logging?.events?.messageEdit ?? true;
    if (!settings.logging?.enabled || !enabled) return;

    const showContent = settings.logging.messageContent === true;

    const before =
      showContent && oldMessage.content?.length
        ? oldMessage.content
        : "*Hidden (privacy mode)*";

    const after =
      showContent && newMessage.content?.length
        ? newMessage.content
        : "*Hidden (privacy mode)*";

    await logEvent({
      guild: oldMessage.guild,
      title: "✏️ Message Edited",
      description: [
        `**Author:** ${oldMessage.author.tag}`,
        `**Channel:** ${oldMessage.channel}`,
        `**Before:** ${before}`,
        `**After:** ${after}`,
        `**Message Link:** [Jump](${newMessage.url})`,
      ].join("\n"),
      color: "Yellow",
    });
  },
};
