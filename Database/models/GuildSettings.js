const mongoose = require("mongoose");

const GuildSettingsSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    logging: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
    },

    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      autoRoleId: { type: String, default: null },
    },

    moderation: {
      logActions: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);
