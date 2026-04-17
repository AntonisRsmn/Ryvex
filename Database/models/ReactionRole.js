const mongoose = require("mongoose");

const ReactionRoleSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true, unique: true },
    title: { type: String, default: "Role Selection" },
    description: { type: String, default: null },
    roles: [
      {
        roleId: { type: String, required: true },
        emoji: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

ReactionRoleSchema.index({ guildId: 1 });

module.exports = mongoose.model("ReactionRole", ReactionRoleSchema);
