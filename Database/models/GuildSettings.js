const mongoose = require("mongoose");

const GuildSettingsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },

    logging: {
      enabled: { type: Boolean, default: true },
      channelId: { type: String, default: null },
      messageContent: { type: Boolean, default: false },
      events: { type: Object, default: {} },
    },

    moderation: {
      enabled: { type: Boolean, default: true },
      channelId: { type: String, default: null },
      logActions: { type: Boolean, default: true },
    },

    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      autoRoleId: { type: String, default: null },
    },

    automod: {
      enabled: { type: Boolean, default: false },

      spam: { type: Boolean, default: false },
      links: { type: Boolean, default: false },
      badWords: { type: Boolean, default: false },

      channels: {
        ignored: { type: [String], default: [] },
        spamDisabled: { type: [String], default: [] },
        linksAllowed: { type: [String], default: [] },
        badWordsDisabled: { type: [String], default: [] },
      },

      punishments: {
        enabled: { type: Boolean, default: true },
        warnOnly: { type: Boolean, default: false },
        timeoutAfter: { type: Number, default: 3 },
        durations: {
          type: Map,
          of: Number,
          default: {
            3: 10 * 60 * 1000,
            4: 60 * 60 * 1000,
            5: 24 * 60 * 60 * 1000,
          },
        },
      },

      badWordsCustom: {
        enabled: { type: Boolean, default: false },
        words: { type: [String], default: [] },
      },
    },

    // 🔐 Appeals system (NEW)
    appeals: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      cooldownMs: { type: Number, default: 12 * 60 * 60 * 1000 }, // 12h
    },

    meta: {
      setupCompleted: { type: Boolean, default: false },
      version: { type: String, default: "1.9.1" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);
