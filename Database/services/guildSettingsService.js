const GuildSettings = require("../models/GuildSettings");

async function getGuildSettings(guildId) {
  try {
  const settings = await GuildSettings.findOneAndUpdate(
    { guildId },
    { $setOnInsert: { guildId } },
    { returnDocument: 'after', upsert: true }
  );

  let save = false;

  settings.automod ??= {};
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

  settings.appeals ??= {
    enabled: false,
    channelId: null,
    cooldownMs: 12 * 60 * 60 * 1000,
  };

  settings.leveling ??= {
    enabled: false,
    channelId: null,
    xpMin: 15,
    xpMax: 25,
    cooldown: 60_000,
    ignoredChannels: [],
    ignoredRoles: [],
    roleRewards: [],
  };

  // 🚨 Staff monitoring defaults
  settings.staffMonitoring ??= {
    enabled: false,
    alerts: [],
    suppression: {},
  };

  settings.staffMonitoring.alerts ??= [];
  settings.staffMonitoring.suppression ??= {};

  // 🛡️ Anti-raid defaults
  settings.antiRaid ??= {
    enabled: false,
    threshold: 10,
    window: 30,
    action: "lock",
    alertChannelId: null,
  };

  save = true;

  if (save) await settings.save();
  return settings;
  } catch (err) {
    console.error("[getGuildSettings]", err);
    return null;
  }
}

async function updateGuildSettings(guildId, updates) {
  try {
  return GuildSettings.findOneAndUpdate(
    { guildId },
    { $set: updates },
    { returnDocument: 'after', upsert: true }
  );
  } catch (err) {
    console.error("[updateGuildSettings]", err);
    return null;
  }
}

module.exports = { getGuildSettings, updateGuildSettings };
