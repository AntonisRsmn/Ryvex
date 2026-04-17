const mongoose = require("mongoose");

const AfkSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, default: "AFK" },
  },
  { timestamps: true }
);

AfkSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Afk", AfkSchema);
