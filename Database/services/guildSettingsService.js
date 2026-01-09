const GuildSettings = require("../models/GuildSettings");

async function getGuildSettings(guildId) {
  let settings = await GuildSettings.findOne({ guildId });

  // ───────── CREATE WITH FULL DEFAULTS ─────────
  if (!settings) {
    settings = await GuildSettings.create({
      guildId,
      logging: {
        enabled: true,
        channelId: null,
        messageContent: false, // 🔒 PRIVACY ON by default
        events: {}
      },
      welcome: {
        enabled: false,
        channelId: null,
        autoRoleId: null
      },
      moderation: {
        logActions: true
      }
    });

    return settings;
  }

  // ───────── SAFETY BACKFILL (VERY IMPORTANT) ─────────
  let needsSave = false;

  if (!settings.logging) {
    settings.logging = {};
    needsSave = true;
  }

  if (typeof settings.logging.messageContent !== "boolean") {
    settings.logging.messageContent = false; // default privacy ON
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
