const { logEvent } = require("../../Utils/logEvent");

module.exports = {
  name: "channelCreate",
  async execute(channel) {
    if (!channel.guild) return;

    await logEvent({
      guild: channel.guild,
      title: "📁 Channel Created",
      description: `${channel} was created.`,
    });
  },
};
