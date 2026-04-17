const { logEvent } = require("./logEvent");
const ModAction = require("../Database/models/ModAction");

/* ───────── CASE ID ───────── */
async function getNextCaseId(guildId) {
  const last = await ModAction.findOne({ guildId })
    .sort({ caseId: -1 })
    .select("caseId")
    .lean();

  return last ? last.caseId + 1 : 1;
}

/* ───────── LOG ACTION ───────── */
async function logAction({
  guild,
  action,
  target,
  moderator,
  reason = "No reason provided",
  duration,
  extra = {},
}) {
  try {
  if (!guild || !action || !target || !moderator) return;

  const caseId = await getNextCaseId(guild.id);

  const record = await ModAction.create({
    guildId: guild.id,
    caseId,
    action,
    targetId: target.id,
    targetTag: target.tag ?? target.username ?? String(target),
    moderatorId: moderator.id,
    moderatorTag: moderator.tag ?? moderator.username ?? String(moderator),
    reason,
    extra: {
      ...(duration ? { duration } : {}),
      ...extra,
    },
  });

  /* ───────── COLOR MAP ───────── */
  const colorMap = {
    Warn: "Yellow",
    "Remove Warning": "Green",
    "Clear Warnings": "Green",
    Timeout: "Orange",
    "Auto Timeout": "Orange",
    Kick: "DarkOrange",
    Ban: "DarkRed",
    Unban: "Green",
    "Edit Case": "Blue",
    "Delete Case": "DarkGrey",
  };

  const embedColor = colorMap[action] ?? "Red";

  const lines = [
    `**⚔ Action:** ${action}`,
    `**👤 Target:** ${record.targetTag}`,
    `**🛠 Moderator:** ${record.moderatorTag}`,
    `**📄 Reason:** ${reason}`,
  ];

  if (record.extra?.duration) {
    lines.push(`**⏳ Duration:** ${record.extra.duration}`);
  }

  lines.push(`**🧾 Case ID:** ${record.caseId}`);

  await logEvent({
    guild,
    type: "moderation",
    title: `🛡 Moderation Case #${record.caseId}`,
    description: lines.join("\n"),
    color: embedColor,
  });
  } catch (err) {
    console.error("[logAction]", err);
  }
}

module.exports = { logAction };
