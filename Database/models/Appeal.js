// Database/models/Appeal.js
const mongoose = require("mongoose");

const AppealSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  caseId: Number,
  channelId: String,
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  openedAt: { type: Date, default: Date.now },
  closedAt: Date,
});

module.exports = mongoose.model("Appeal", AppealSchema);
