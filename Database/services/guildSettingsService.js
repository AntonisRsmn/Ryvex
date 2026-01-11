const GuildSettings = require("../models/GuildSettings");

async function getGuildSettings(guildId) {
  const settings = await GuildSettings.findOneAndUpdate(
    { guildId },
    {
      $setOnInsert: {
        guildId,
        logging: {
          enabled: true,
          channelId: null,
          messageContent: false, // 🔒 privacy ON by default
          events: {},
        },
        welcome: {
          enabled: false,
          channelId: null,
          autoRoleId: null,
        },
        moderation: {
          logActions: true,
        },
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  // ───────── SAFETY BACKFILL ─────────
  let needsSave = false;

  if (!settings.logging) {
    settings.logging = {};
    needsSave = true;
  }

  if (typeof settings.logging.messageContent !== "boolean") {
    settings.logging.messageContent = false;
    needsSave = true;
  }

  if (!settings.logging.events) {
    settings.logging.events = {};
    needsSave = true;
  }

  if (needsSave) {
    await settings.save();
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
