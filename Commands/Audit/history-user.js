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
    .setName("history-user")
    .setDescription("View moderation history for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt
        .setName("member")
        .setDescription("Target member")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const user = interaction.options.getUser("member");

    const cases = await ModAction.find({
      guildId,
      targetId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!cases.length) {
      return interaction.editReply(
        `✅ No moderation history found for **${user.tag}**.`
      );
    }

    /* ───────── SUMMARY STATS ───────── */
    const counts = {};
    for (const c of cases) {
      counts[c.action] = (counts[c.action] || 0) + 1;
    }

    const firstAction = cases[cases.length - 1];
    const lastAction = cases[0];
    const firstTs = Math.floor(new Date(firstAction.createdAt).getTime() / 1000);
    const lastTs = Math.floor(new Date(lastAction.createdAt).getTime() / 1000);

    const summaryLines = [
      `📋 **Total:** ${cases.length} action${cases.length !== 1 ? "s" : ""}`,
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
    const totalPages = Math.ceil(cases.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = cases.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const entries = slice.map(c => {
        const icon = ACTION_META[c.action] ?? "❓";
        const ts = Math.floor(new Date(c.createdAt).getTime() / 1000);
        const reason = (c.reason ?? "No reason provided").slice(0, 100);
        const duration = c.extra?.duration
          ? ` • Duration: **${c.extra.duration}**`
          : "";
        return [
          `${icon} **#${c.caseId} • ${c.action}**${duration}`,
          `> 🛠 ${c.moderatorTag} • <t:${ts}:R>`,
          `> 📝 ${reason}`,
        ].join("\n");
      });

      const description = page === 0
        ? [summaryLines.join("\n"), "", ...entries].join("\n\n")
        : entries.join("\n\n");

      return new EmbedBuilder()
        .setTitle(`📜 Moderation History — ${user.tag}`)
        .setColor("Red")
        .setThumbnail(user.displayAvatarURL({ size: 128 }))
        .setDescription(description)
        .setFooter({ text: `Ryvex • Page ${page + 1} / ${totalPages}` })
        .setTimestamp();
    };

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("huser_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("huser_next")
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

      if (i.customId === "huser_prev") page--;
      if (i.customId === "huser_next") page++;
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
