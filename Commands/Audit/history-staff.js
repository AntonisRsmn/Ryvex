const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");

const PAGE_SIZE = 5;

/* ───────── ACTION ICONS ───────── */
const ACTION_META = {
  Warn: "⚠️",
  Timeout: "⏳",
  "Auto Timeout": "⏳",
  Kick: "👢",
  Ban: "🔨",
  Unban: "♻️",
  "Clear Messages": "🧹",
  "Edit Case": "✏️",
  "Delete Case": "🗑️",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history-staff")
    .setDescription("View moderation history")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt
        .setName("moderator")
        .setDescription("Staff member")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const moderator = interaction.options.getUser("moderator");

    const actions = await ModAction.find({
      guildId,
      moderatorId: moderator.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!actions.length) {
      return interaction.editReply(
        `✅ No moderation actions found for **${moderator.tag}**.`
      );
    }

    /* ───────── SUMMARY STATS ───────── */
    const counts = {};
    const uniqueTargets = new Set();
    for (const a of actions) {
      counts[a.action] = (counts[a.action] || 0) + 1;
      uniqueTargets.add(a.targetId);
    }

    const firstAction = actions[actions.length - 1];
    const lastAction = actions[0];
    const firstTs = Math.floor(new Date(firstAction.createdAt).getTime() / 1000);
    const lastTs = Math.floor(new Date(lastAction.createdAt).getTime() / 1000);

    const summaryLines = [
      `📋 **Total:** ${actions.length} action${actions.length !== 1 ? "s" : ""} against **${uniqueTargets.size}** unique member${uniqueTargets.size !== 1 ? "s" : ""}`,
    ];
    if (counts["Warn"]) summaryLines.push(`> ⚠️ Warns: ${counts["Warn"]}`);
    if (counts["Timeout"] || counts["Auto Timeout"])
      summaryLines.push(`> ⏳ Timeouts: ${(counts["Timeout"] ?? 0) + (counts["Auto Timeout"] ?? 0)}`);
    if (counts["Kick"]) summaryLines.push(`> 👢 Kicks: ${counts["Kick"]}`);
    if (counts["Ban"]) summaryLines.push(`> 🔨 Bans: ${counts["Ban"]}`);
    if (counts["Unban"]) summaryLines.push(`> ♻️ Unbans: ${counts["Unban"]}`);
    summaryLines.push("");
    summaryLines.push(`> First action: <t:${firstTs}:R> • Last: <t:${lastTs}:R>`);

    let page = 0;
    const totalPages = Math.ceil(actions.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = actions.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const entries = slice.map(a => {
        const icon = ACTION_META[a.action] ?? "🛡️";
        const ts = Math.floor(new Date(a.createdAt).getTime() / 1000);
        const reason = (a.reason ?? "No reason provided").slice(0, 100);
        const duration = a.extra?.duration
          ? ` • Duration: **${a.extra.duration}**`
          : "";
        return [
          `${icon} **#${a.caseId} • ${a.action}**${duration}`,
          `> 🎯 ${a.targetTag} • <t:${ts}:R>`,
          `> 📝 ${reason}`,
        ].join("\n");
      });

      const description = page === 0
        ? [summaryLines.join("\n"), "", ...entries].join("\n\n")
        : entries.join("\n\n");

      return new EmbedBuilder()
        .setTitle(`🧑‍⚖️ Staff History — ${moderator.tag}`)
        .setColor("Blue")
        .setThumbnail(moderator.displayAvatarURL({ size: 128 }))
        .setDescription(description)
        .setFooter({ text: `Ryvex • Page ${page + 1} / ${totalPages}` })
        .setTimestamp();
    };

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("hstaff_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("hstaff_next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1),
      );

    const message = await interaction.editReply({
      embeds: [buildEmbed()],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This menu isn't for you.",
          ephemeral: true,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "hstaff_prev") page--;
      if (i.customId === "hstaff_next") page++;
      page = Math.max(0, Math.min(page, totalPages - 1));

      await interaction.editReply({
        embeds: [buildEmbed()],
        components: [buildRow()],
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        ...buildRow().components.map(b => b.setDisabled(true))
      );
      await interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  },
};
