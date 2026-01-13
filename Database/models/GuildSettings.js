const mongoose = require("mongoose");

const GuildSettingsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },

    /* ───────── LOGGING SYSTEM ───────── */
    logging: {
      enabled: {
        type: Boolean,
        default: true, // logging ON by default
      },

      // General logs channel
      channelId: {
        type: String,
        default: null,
      },

      // Privacy control
      messageContent: {
        type: Boolean,
        default: false, // 🔒 privacy ON by default
      },

      /* Event toggles */
      events: {
        memberJoin: { type: Boolean, default: true },
        memberLeave: { type: Boolean, default: true },
        memberUpdate: { type: Boolean, default: true },

        messageDelete: { type: Boolean, default: true },
        messageEdit: { type: Boolean, default: true },

        channelCreate: { type: Boolean, default: true },
        channelUpdate: { type: Boolean, default: true },
        channelDelete: { type: Boolean, default: true },

        roleCreate: { type: Boolean, default: true },
        roleUpdate: { type: Boolean, default: true },
        roleDelete: { type: Boolean, default: true },

        guildUpdate: { type: Boolean, default: true },
      },
    },

    /* ───────── MODERATION LOGS ───────── */
    moderation: {
      enabled: {
        type: Boolean,
        default: true,
      },

      // Separate moderation log channel
      channelId: {
        type: String,
        default: null,
      },

      logActions: {
        type: Boolean,
        default: true,
      },
    },

    /* ───────── WELCOME SYSTEM ───────── */
    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      autoRoleId: { type: String, default: null },
    },

    /* ───────── META / UTILS ───────── */
    meta: {
      setupCompleted: {
        type: Boolean,
        default: false,
      },

      version: {
        type: String,
        default: "1.9.1",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema);
