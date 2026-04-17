const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const ModAction = require("../../Database/models/ModAction");
const UserLevel = require("../../Database/models/UserLevel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View detailed information about a server member.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Select a user (defaults to yourself).")
    ),

  async execute(interaction) {
    try {
      const user =
        interaction.options.getUser("user") || interaction.user;

      const member = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      if (!member) {
        return respond(interaction, {
          content: "❌ This user is not a member of the server.",
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── GATHER DATA ───────── */
      const [modActions, levelData, allMembers] = await Promise.all([
        ModAction.find({
          guildId: interaction.guild.id,
          targetId: user.id,
        }).lean(),
        UserLevel.findOne({
          guildId: interaction.guild.id,
          userId: user.id,
        }).lean(),
        interaction.guild.members.fetch().catch(() => interaction.guild.members.cache),
      ]);

      /* ───────── IDENTITY DATA ───────── */
      const createdTs = Math.floor(user.createdAt.getTime() / 1000);
      const joinedTs = Math.floor(member.joinedAt.getTime() / 1000);
      const isOwner = interaction.guild.ownerId === user.id;
      const isBot = user.bot;

      const badges = [];
      if (isOwner) badges.push("👑 Server Owner");
      if (isBot) badges.push("🤖 Bot");
      if (member.premiumSince) badges.push("💎 Server Booster");
      if (member.permissions.has("Administrator")) badges.push("⚙️ Administrator");

      /* ───────── ROLES ───────── */
      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position);
      const roleCount = roles.size;
      const topRoles = roles.first(15).map(r => r.toString()).join(", ");
      const highestRole = roles.first();

      /* ───────── JOIN POSITION ───────── */
      const sorted = [...allMembers.values()].sort(
        (a, b) => (a.joinedTimestamp ?? 0) - (b.joinedTimestamp ?? 0)
      );
      const joinPosition = sorted.findIndex(m => m.id === user.id) + 1;

      /* ───────── MODERATION STATS ───────── */
      const actionCounts = {};
      for (const a of modActions) {
        actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
      }
      const totalActions = modActions.length;
      const lastAction = modActions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      /* ───────── XP DATA ───────── */
      const level = levelData?.level ?? 0;
      const xp = levelData?.xp ?? 0;
      const totalMessages = levelData?.totalMessages ?? 0;
      const xpNeeded = UserLevel.xpForLevel(level);
      const progress = xpNeeded > 0 ? Math.min(xp / xpNeeded, 1) : 0;
      const barLen = 12;
      const filled = Math.round(progress * barLen);
      const xpBar = "█".repeat(filled) + "░".repeat(barLen - filled);

      /* ───────── COLOR ───────── */
      const color = highestRole?.color || 0xffffff;

      /* ═══════════════════════════════════════
         PAGES
         ═══════════════════════════════════════ */
      const pages = [

        /* ───── PAGE 1: IDENTITY ───── */
        new EmbedBuilder()
          .setTitle(`👤 ${user.tag}`)
          .setColor(color)
          .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }))
          .setDescription(
            [
              badges.length ? badges.join(" • ") : "",
              "",
              "**Account**",
              `> 🆔 ID: \`${user.id}\``,
              `> 🏷 Nickname: ${member.nickname ?? "None"}`,
              `> 📅 Created: <t:${createdTs}:D> (<t:${createdTs}:R>)`,
              "",
              "**Server Presence**",
              `> 📥 Joined: <t:${joinedTs}:D> (<t:${joinedTs}:R>)`,
              `> 📊 Join position: **#${joinPosition || "?"}** / ${allMembers.size}`,
              member.premiumSince
                ? `> 💎 Boosting since: <t:${Math.floor(member.premiumSince.getTime() / 1000)}:R>`
                : "",
              "",
              `**Roles** [${roleCount}]`,
              roleCount > 0
                ? `> ${topRoles}${roleCount > 15 ? ` + ${roleCount - 15} more` : ""}`
                : "> None",
              highestRole
                ? `> Highest: ${highestRole}`
                : "",
            ].filter(Boolean).join("\n")
          ),

        /* ───── PAGE 2: MODERATION ───── */
        new EmbedBuilder()
          .setTitle(`🛡️ Moderation — ${user.tag}`)
          .setColor(totalActions > 0 ? "Red" : "Green")
          .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }))
          .setDescription(
            totalActions === 0
              ? [
                  "✅ **Clean record** — no moderation actions.",
                  "",
                  "This member has no warnings, timeouts, kicks, or bans on this server.",
                ].join("\n")
              : [
                  `**Total actions:** ${totalActions}`,
                  "",
                  "**Breakdown:**",
                  ...(actionCounts["Warn"]
                    ? [`> ⚠️ Warns: **${actionCounts["Warn"]}**`] : []),
                  ...(actionCounts["Timeout"] || actionCounts["Auto Timeout"]
                    ? [`> ⏳ Timeouts: **${(actionCounts["Timeout"] ?? 0) + (actionCounts["Auto Timeout"] ?? 0)}**`] : []),
                  ...(actionCounts["Kick"]
                    ? [`> 👢 Kicks: **${actionCounts["Kick"]}**`] : []),
                  ...(actionCounts["Ban"]
                    ? [`> 🔨 Bans: **${actionCounts["Ban"]}**`] : []),
                  ...(actionCounts["Unban"]
                    ? [`> ♻️ Unbans: **${actionCounts["Unban"]}**`] : []),
                  "",
                  "**Most recent:**",
                  lastAction
                    ? [
                        `> Case **#${lastAction.caseId}** — ${lastAction.action}`,
                        `> By: ${lastAction.moderatorTag}`,
                        `> Reason: ${lastAction.reason?.slice(0, 100) ?? "No reason"}`,
                        `> Date: <t:${Math.floor(new Date(lastAction.createdAt).getTime() / 1000)}:R>`,
                      ].join("\n")
                    : "> —",
                  "",
                  `Use \`/history-user @${user.username}\` for the full log.`,
                ].join("\n")
          ),

        /* ───── PAGE 3: XP / LEVELING ───── */
        new EmbedBuilder()
          .setTitle(`📊 Leveling — ${user.tag}`)
          .setColor(levelData ? "Blue" : "Grey")
          .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }))
          .setDescription(
            !levelData
              ? [
                  "❌ **No XP data** — this member hasn't earned any XP yet.",
                  "",
                  "XP is earned by chatting when the leveling system is enabled.",
                ].join("\n")
              : [
                  `**Level:** ${level}`,
                  `**XP:** ${xp.toLocaleString()} / ${xpNeeded.toLocaleString()}`,
                  `\`${xpBar}\` ${Math.round(progress * 100)}%`,
                  "",
                  `**Total messages:** ${totalMessages.toLocaleString()}`,
                  "",
                  "**Commands:**",
                  `> \`/rank @${user.username}\` — full rank card`,
                  "> `/leaderboard` — server rankings",
                ].join("\n")
          ),
      ];

      /* ───────── NAVIGATION ───────── */
      let page = 0;

      const buildRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("userinfo_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("userinfo_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === pages.length - 1),
        );

      const applyFooter = () =>
        pages[page].setFooter({
          text: `Ryvex • User Info • Page ${page + 1}/${pages.length}`,
          iconURL: interaction.user.displayAvatarURL(),
        }).setTimestamp();

      applyFooter();

      const msg = await interaction.reply({
        embeds: [pages[page]],
        components: [buildRow()],
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });

      const message = msg?.resource?.message ?? msg;
      if (!message) return;

      const collector = message.createMessageComponentCollector({
        time: 120_000,
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ This menu isn't for you.", ephemeral: true });
        }

        await i.deferUpdate().catch(() => {});

        if (i.customId === "userinfo_prev" && page > 0) page--;
        if (i.customId === "userinfo_next" && page < pages.length - 1) page++;

        applyFooter();
        await interaction.editReply({
          embeds: [pages[page]],
          components: [buildRow()],
        });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          ...buildRow().components.map(b => b.setDisabled(true))
        );
        await interaction.editReply({ components: [disabledRow] }).catch(() => {});
      });
    } catch (error) {
      console.error("Userinfo command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch user information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
