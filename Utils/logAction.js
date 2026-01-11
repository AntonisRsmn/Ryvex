const { EmbedBuilder } = require("discord.js");
const { logEvent } = require("./logEvent");
const ModAction = require("../Database/models/ModAction");

/* ───────── CASE ID ───────── */
async function getNextCaseId(guildId) {
  const last = await ModAction
    .findOne({ guildId })
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
  if (!guild || !action || !target || !moderator) return;

  /* ───────── SAVE TO DATABASE ───────── */
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

  /* ───────── COLOR BY ACTION ───────── */
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

  /* ───────── EMBED ───────── */
  const embed = new EmbedBuilder()
    .setTitle(`🛡 Moderation Case #${record.caseId}`)
    .setColor(embedColor)
    .addFields(
      {
        name: "⚔ Action",
        value: action,
        inline: true,
      },
      {
        name: "👤 Target",
        value: record.targetTag,
        inline: true,
      },
      {
        name: "🛠 Moderator",
        value: record.moderatorTag,
        inline: true,
      },
      {
        name: "📄 Reason",
        value: reason,
        inline: false,
      }
    )
    .setFooter({
      text: "Ryvex • Moderation System",
    })
    .setTimestamp();

  if (record.extra?.duration) {
    embed.addFields({
      name: "⏳ Duration",
      value: record.extra.duration,
      inline: false,
    });
  }

  /* ───────── SEND TO MOD LOG ───────── */
  await logEvent({
    guild,
    type: "moderation",
    title: embed.data.title,
    description: embed.data.fields
      .map(f => `**${f.name}:** ${f.value}`)
      .join("\n"),
    color: embedColor,
  });
}

module.exports = { logAction };
