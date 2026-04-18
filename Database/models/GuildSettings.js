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
      message: { type: String, default: null },
      randomMessagesEnabled: { type: Boolean, default: false },
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

    // 🔐 Appeals system
    appeals: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      cooldownMs: { type: Number, default: 12 * 60 * 60 * 1000 },
    },

    // � Leveling system
    leveling: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null }, // level-up announcement channel (null = same channel)
      xpMin: { type: Number, default: 15 },
      xpMax: { type: Number, default: 25 },
      cooldown: { type: Number, default: 60_000 }, // ms between XP gains
      ignoredChannels: { type: [String], default: [] },
      ignoredRoles: { type: [String], default: [] },
      roleRewards: {
        type: [
          {
            level: Number,
            roleId: String,
          },
        ],
        default: [],
      },
    },

    // �🚨 Staff monitoring
    staffMonitoring: {
      enabled: { type: Boolean, default: false },

      alerts: {
        type: [
          {
            moderatorId: String,
            moderatorTag: String,
            flag: String,
            createdAt: Date,
          },
        ],
        default: [],
      },

      suppression: {
        type: Map,
        of: Date,
        default: {},
      },
    },

    // 🛡️ Anti-raid system
    antiRaid: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 10 },
      window: { type: Number, default: 30 },
      action: { type: String, default: "lock", enum: ["lock", "kick", "alert"] },
      alertChannelId: { type: String, default: null },
    },

    meta: {
      setupCompleted: { type: Boolean, default: false },
      version: { type: String, default: "1.9.8" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);
