const GuildSettings = require("../models/GuildSettings");

async function getGuildSettings(guildId) {
  let settings = await GuildSettings.findOne({ guildId });

  if (!settings) {
    settings = await GuildSettings.create({ guildId });
  }

  return settings;
}

async function updateGuildSettings(guildId, updates) {
  return GuildSettings.findOneAndUpdate(
    { guildId },
    { $set: updates },
    { new: true, upsert: true }
  );
}

module.exports = {
  getGuildSettings,
  updateGuildSettings,
};
