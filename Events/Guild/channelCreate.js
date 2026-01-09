const { ChannelType } = require("discord.js");
const { logEvent } = require("../../Utils/logEvent");
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "channelCreate",

  async execute(channel) {
    const guild = channel.guild;
    if (!guild) return;

    const settings = await getGuildSettings(guild.id);

    // Allow unless explicitly disabled
    if (
      !settings.logging?.enabled ||
      settings.logging.events?.channelCreate === false
    ) {
      return;
    }

    let typeLabel = "Channel";

    if (channel.type === ChannelType.GuildText) {
      typeLabel = "📝 Text Channel";
    } else if (channel.type === ChannelType.GuildVoice) {
      typeLabel = "🔊 Voice Channel";
    } else if (channel.type === ChannelType.GuildAnnouncement) {
      typeLabel = "📢 Announcement Channel";
    } else if (channel.type === ChannelType.GuildForum) {
      typeLabel = "🧵 Forum Channel";
    } else if (channel.type === ChannelType.GuildCategory) {
      typeLabel = "📁 Category";
    }

    await logEvent({
      guild,
      title: `${typeLabel} Created`,
      description: `**Name:** ${channel.name}`,
      color: "Blue",
    });
  },
};
