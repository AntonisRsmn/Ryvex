const badWordsData = require("../../Data/badwords.json");
const {
  isSpamming,
  getSpamMessages,
  clearSpamMessages,
} = require("./spamTracker");
const { PermissionFlagsBits } = require("discord.js");
const { logAction } = require("../logAction");
const ModAction = require("../../Database/models/ModAction");
const { suppress } = require("./suppressDelete");

/* ───────── BUILD BAD WORD REGEX (JSON + CUSTOM) ───────── */
function buildBadWordRegex(settings) {
  const words = new Set();

  if (badWordsData?.categories) {
    for (const cat of Object.values(badWordsData.categories)) {
      if (!cat.enabled) continue;
      for (const w of cat.words ?? []) {
        if (typeof w === "string" && w.length) {
          words.add(w.toLowerCase());
        }
      }
    }
  }

  if (settings?.badWordsCustom?.enabled) {
    for (const w of settings.badWordsCustom.words ?? []) {
      if (typeof w === "string" && w.length) {
        words.add(w.toLowerCase());
      }
    }
  }

  if (!words.size) return null;

  const escaped = [...words].map(w =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  return new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
}

/* ───────── LOG AUTOMOD WARN (NO MOD LOG) ───────── */
async function addWarn({ guild, member, type, reason }) {
  await ModAction.create({
    guildId: guild.id,
    caseId: 0, // optional or omit if schema allows
    action: type,
    targetId: member.id,
    targetTag: member.user.tag,
    moderatorId: guild.members.me.id,
    moderatorTag: guild.members.me.user.tag,
    reason,
  });
}


/* ───────── TOTAL AUTOMOD WARNS (STICKY COUNTER) ───────── */
async function getTotalAutoModWarns(guildId, memberId) {
  return ModAction.countDocuments({
    guildId,
    targetId: memberId,
    action: { $regex: "^AutoMod" },
  });
}

/* ───────── STICKY MAX PUNISHMENT ───────── */
async function punish(member, totalWarns, punishments, reason) {
  if (!member.moderatable) return;
  if (!punishments?.enabled) return;
  if (punishments.warnOnly) return;
  if (totalWarns < punishments.timeoutAfter) return;

  const duration =
    punishments.durations?.get(String(totalWarns)) ??
    punishments.durations?.get(String(punishments.timeoutAfter));

  if (!duration) return;

  await member.timeout(duration, reason).catch(() => {});

  await logAction({
    guild: member.guild,
    action: "Auto Timeout",
    target: member.user,
    moderator: member.guild.members.me.user,
    reason,
    duration,
  });
}

/* ───────── MAIN AUTOMOD ───────── */
module.exports = async function runAutoMod({ message, automod }) {
  const { member, author, guild, channel } = message;
  if (!member || author.bot) return;

  /* ───────── PERMISSION & ROLE BYPASS ───────── */
  if (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageMessages)
  ) return;

  if (
    automod.rolesBypass?.some(roleId =>
      member.roles.cache.has(roleId)
    )
  ) return;

  if (automod.channels?.ignored?.includes(channel.id)) return;

  const punishments = automod.punishments ?? {};
  const badWordRegex = buildBadWordRegex(automod);

  /* ───────── SPAM ───────── */
  if (automod.spam && !automod.channels?.spamDisabled?.includes(channel.id)) {
    if (isSpamming(author.id, message)) {
      const spamMessages = [...new Set(getSpamMessages(author.id))];

      await Promise.all(
        spamMessages.map(m => {
          suppress(m.id);
          return m.delete().catch(() => {});
        })
      );

      clearSpamMessages(author.id);

      await logAction({
        guild,
        action: "AutoMod Spam Cleanup",
        target: member.user,
        moderator: guild.members.me.user,
        reason: `Deleted ${spamMessages.length} spam messages`,
      });

      await addWarn({
        guild,
        member,
        type: "AutoModSpam",
        reason: "Spamming messages",
      });

      const totalWarns = await getTotalAutoModWarns(guild.id, member.id);
      await punish(member, totalWarns, punishments, "AutoMod: Spam");

      channel.send(
        `🚫 ${author}, stop spamming (**${totalWarns} warns**)`
      ).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

      return;
    }
  }

  /* ───────── LINKS ───────── */
  if (
    automod.links &&
    !automod.channels?.linksAllowed?.includes(channel.id) &&
    /(https?:\/\/|www\.)\S+/i.test(message.content)
  ) {
    await message.delete().catch(() => {});

    await addWarn({
      guild,
      member,
      type: "AutoModLinks",
      reason: "Posting links",
    });

    const totalWarns = await getTotalAutoModWarns(guild.id, member.id);
    await punish(member, totalWarns, punishments, "AutoMod: Links");

    channel.send(
      `🔗 ${author}, links are not allowed (**${totalWarns} warns**)`
    ).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

    return;
  }

  /* ───────── BAD WORDS ───────── */
  if (
    automod.badWords &&
    badWordRegex &&
    !automod.channels?.badWordsDisabled?.includes(channel.id) &&
    badWordRegex.test(message.content)
  ) {
    await message.delete().catch(() => {});

    await addWarn({
      guild,
      member,
      type: "AutoModBadWords",
      reason: "Bad language",
    });

    const totalWarns = await getTotalAutoModWarns(guild.id, member.id);
    await punish(member, totalWarns, punishments, "AutoMod: Bad language");

    channel.send(
      `🤬 ${author}, watch your language (**${totalWarns} warns**)`
    ).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
  }
};
