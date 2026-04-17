const mongoose = require("mongoose");

const UserLevelSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserLevelSchema.index({ guildId: 1, userId: 1 }, { unique: true });
UserLevelSchema.index({ guildId: 1, xp: -1 });

/**
 * Calculate the XP required for a given level.
 * Formula: 5 * level^2 + 50 * level + 100
 */
UserLevelSchema.statics.xpForLevel = function (level) {
  return 5 * level * level + 50 * level + 100;
};

module.exports = mongoose.model("UserLevel", UserLevelSchema);
