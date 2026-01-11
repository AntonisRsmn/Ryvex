const mongoose = require("mongoose");

const ModActionSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    caseId: { type: Number, required: true },

    action: { type: String, required: true },

    targetId: { type: String, required: true },
    targetTag: { type: String, required: true },

    moderatorId: { type: String, required: true },
    moderatorTag: { type: String, required: true },

    reason: { type: String, default: "No reason provided" },

    extra: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ModAction", ModActionSchema);
