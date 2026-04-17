const { Events, EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const runAutoMod = require("../../Utils/automodChecks/automod");
const Afk = require("../../Database/models/Afk");
const UserLevel = require("../../Database/models/UserLevel");

// In-memory XP cooldown: "guildId-userId" → timestamp
const xpCooldowns = new Map();

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    try {
    if (!message.guild) return;
    if (message.author.bot) return;

    /* ───────── AFK SYSTEM ───────── */

    // If the author is AFK, remove their status
    const authorAfk = await Afk.findOneAndDelete({
      guildId: message.guild.id,
      userId: message.author.id,
    });

    if (authorAfk) {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ Welcome back, ${message.author}! Your AFK status has been removed.`);

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 8_000);
      }).catch(() => {});
    }

    // If the message mentions any AFK users, notify the author
    const mentionedUsers = message.mentions.users.filter(u => !u.bot && u.id !== message.author.id);

    if (mentionedUsers.size > 0) {
      const afkEntries = await Afk.find({
        guildId: message.guild.id,
        userId: { $in: mentionedUsers.map(u => u.id) },
      });

      if (afkEntries.length > 0) {
        const lines = afkEntries.map(entry => {
          const timestamp = Math.floor(entry.createdAt.getTime() / 1000);
          return `💤 **<@${entry.userId}>** is AFK: ${entry.reason} — <t:${timestamp}:R>`;
        });

        const embed = new EmbedBuilder()
          .setColor("White")
          .setDescription(lines.join("\n"));

        message.reply({ embeds: [embed] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 10_000);
        }).catch(() => {});
      }
    }

    /* ───────── AUTOMOD ───────── */
    const settings = await getGuildSettings(message.guild.id);

    /* ───────── LEVELING / XP ───────── */
    if (settings.leveling?.enabled) {
      const lv = settings.leveling;
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      const cooldown = lv.cooldown ?? 60_000;

      // Skip if user is on cooldown
      const lastXp = xpCooldowns.get(key) ?? 0;
      if (now - lastXp >= cooldown) {
        // Skip ignored channels/roles
        const inIgnoredChannel = lv.ignoredChannels?.includes(message.channel.id);
        const hasIgnoredRole = lv.ignoredRoles?.some(rId =>
          message.member?.roles.cache.has(rId)
        );

        if (!inIgnoredChannel && !hasIgnoredRole) {
          xpCooldowns.set(key, now);

          const xpMin = lv.xpMin ?? 15;
          const xpMax = lv.xpMax ?? 25;
          const xpGain = Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;

          const data = await UserLevel.findOneAndUpdate(
            { guildId: message.guild.id, userId: message.author.id },
            { $inc: { xp: xpGain, totalMessages: 1 } },
            { upsert: true, returnDocument: "after" }
          );

          const needed = UserLevel.xpForLevel(data.level);

          if (data.xp >= needed) {
            // Level up
            data.xp -= needed;
            data.level += 1;
            await data.save();

            // Send level-up message
            const announceChannel = lv.channelId
              ? message.guild.channels.cache.get(lv.channelId)
              : message.channel;

            if (announceChannel) {
              const lvEmbed = new EmbedBuilder()
                .setColor("White")
                .setDescription(
                  `🎉 **${message.author}** just reached **Level ${data.level}**!`
                );

              announceChannel.send({ embeds: [lvEmbed] }).catch(() => {});
            }

            // Assign role rewards
            const rewards = lv.roleRewards ?? [];
            for (const reward of rewards) {
              if (reward.level === data.level && message.member) {
                const role = message.guild.roles.cache.get(reward.roleId);
                if (role && !message.member.roles.cache.has(role.id)) {
                  message.member.roles.add(role).catch(() => {});
                }
              }
            }
          }
        }
      }
    }

    if (!settings?.automod?.enabled) return;

    await runAutoMod({
      message,
      automod: settings.automod,
    });
    } catch (err) {
      console.error("[messageCreate]", err);
    }
  },
};
