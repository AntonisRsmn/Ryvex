const { logEvent } = require("../../Utils/logEvent");

module.exports = {
  name: "channelDelete",
  async execute(channel) {
    if (!channel.guild) return;

    await logEvent({
      guild: channel.guild,
      title: "🗑 Channel Deleted",
      description: `#${channel.name} was deleted.`,
    });
  },
};
