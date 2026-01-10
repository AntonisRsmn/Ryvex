const { logEvent } = require("./logEvent");
const { EmbedBuilder } = require("discord.js");

async function logAction({
  guild,
  action,
  target,
  moderator,
  reason = "No reason provided",
  duration,
}) {
  const description = [
    `**Action:** ${action}`,
    `**Target:** ${target}`,
    `**Moderator:** ${moderator}`,
    reason ? `**Reason:** ${reason}` : null,
    duration ? `**Duration:** ${duration}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await logEvent({
    guild,
    type: "moderation", // 🔥 THIS IS THE KEY LINE
    title: "🛡 Moderation Log",
    description,
    color: "Red",
  });
}

module.exports = { logAction };
