const mongoose = require("mongoose");

const GuildSettingsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },

    logging: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },

      messageContent: {
        type: Boolean,
        default: false, // privacy ON by default
      },

      events: {
        memberJoin: { type: Boolean, default: true },
        memberLeave: { type: Boolean, default: true },
        messageDelete: { type: Boolean, default: true },
        messageEdit: { type: Boolean, default: true },
      },
    },

    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      autoRoleId: { type: String, default: null },
    },

    moderation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      channelId: {
        type: String,
        default: null,
      },
      logActions: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);
