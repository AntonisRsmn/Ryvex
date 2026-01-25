const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true }, // Rule number (1,2,3…)
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const GuildRulesSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    rules: { type: [RuleSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuildRules", GuildRulesSchema);
