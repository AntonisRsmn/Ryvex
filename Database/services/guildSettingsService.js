const GuildSettings = require("../models/GuildSettings");

async function getGuildSettings(guildId) {
  const settings = await GuildSettings.findOneAndUpdate(
    { guildId },
    { $setOnInsert: { guildId } },
    { new: true, upsert: true }
  );

  let save = false;

  if (!settings.automod) {
    settings.automod = {};
    save = true;
  }

  settings.automod.enabled ??= false;
  settings.automod.spam ??= false;
  settings.automod.links ??= false;
  settings.automod.badWords ??= false;

  settings.automod.channels ??= {
    ignored: [],
    spamDisabled: [],
    linksAllowed: [],
    badWordsDisabled: [],
  };

  settings.automod.punishments ??= {
    enabled: true,
    warnOnly: false,
    timeoutAfter: 3,
    durations: {
      3: 10 * 60 * 1000,
      4: 60 * 60 * 1000,
      5: 24 * 60 * 60 * 1000,
    },
  };

  settings.automod.badWordsCustom ??= {
    enabled: false,
    words: [],
  };

  if (save) await settings.save();
  return settings;
}

async function updateGuildSettings(guildId, updates) {
  return GuildSettings.findOneAndUpdate(
    { guildId },
    { $set: updates },
    { new: true, upsert: true }
  );
}

module.exports = { getGuildSettings, updateGuildSettings };
