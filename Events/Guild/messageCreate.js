const { Events } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const runAutoMod = require("../../Utils/automodChecks/automod");

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const settings = await getGuildSettings(message.guild.id);
    if (!settings?.automod?.enabled) return;

    await runAutoMod({
      message,
      automod: settings.automod,
    });
  },
};
