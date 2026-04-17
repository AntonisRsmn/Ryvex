const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const { respond } = require("../../Utils/respond");

const PAGE_SIZE = 5;

/* ───────── ACTION ICONS ───────── */
const ACTION_META = {
  Warn: "⚠️",
  Timeout: "⏳",
  "Auto Timeout": "⏳",
  Kick: "👢",
  Ban: "🔨",
  Unban: "♻️",
  AutoModSpam: "🤖",
  AutoModLinks: "🔗",
  AutoModBadWords: "🤬",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View your moderation history"),

  async execute(interaction) {
    const actions = await ModAction.find({
      guildId: interaction.guild.id,
      targetId: interaction.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!actions.length) {
      return respond(interaction, {
        content: "✅ You have no moderation history on this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    /* ───────── SUMMARY STATS ───────── */
    const counts = {};
    for (const a of actions) {
      counts[a.action] = (counts[a.action] || 0) + 1;
    }

    const summaryLines = [
      `📋 **Total:** ${actions.length} action${actions.length !== 1 ? "s" : ""}`,
    ];
    if (counts["Warn"]) summaryLines.push(`> ⚠️ Warns: ${counts["Warn"]}`);
    if (counts["Timeout"] || counts["Auto Timeout"])
      summaryLines.push(`> ⏳ Timeouts: ${(counts["Timeout"] ?? 0) + (counts["Auto Timeout"] ?? 0)}`);
    if (counts["Kick"]) summaryLines.push(`> 👢 Kicks: ${counts["Kick"]}`);
    if (counts["Ban"]) summaryLines.push(`> 🔨 Bans: ${counts["Ban"]}`);
    if (counts["Unban"]) summaryLines.push(`> ♻️ Unbans: ${counts["Unban"]}`);

    let page = 0;
    const totalPages = Math.ceil(actions.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = actions.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const entries = slice.map(record => {
        const icon = ACTION_META[record.action] ?? "🛡️";
        const ts = Math.floor(new Date(record.createdAt).getTime() / 1000);
        const reason = (record.reason ?? "No reason provided").slice(0, 100);
        const duration = record.extra?.duration
          ? ` • Duration: **${record.extra.duration}**`
          : "";
        return [
          `${icon} **#${record.caseId} • ${record.action}**${duration}`,
          `> 👮 ${record.moderatorTag || "AutoMod"} • <t:${ts}:R>`,
          `> 📝 ${reason}`,
        ].join("\n");
      });

      const description = page === 0
        ? [summaryLines.join("\n"), "", ...entries].join("\n\n")
        : entries.join("\n\n");

      return new EmbedBuilder()
        .setTitle("🛡️ Your Moderation History")
        .setColor("DarkRed")
        .setDescription(description)
        .setFooter({ text: `Ryvex • Page ${page + 1} / ${totalPages}` })
        .setTimestamp();
    };

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("history_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("history_next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1),
      );

    const response = await interaction.reply({
      embeds: [buildEmbed()],
      components: [buildRow()],
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    const message = response.resource.message;

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This menu isn't for you.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "history_next") page++;
      if (i.customId === "history_prev") page--;
      page = Math.max(0, Math.min(page, totalPages - 1));

      await interaction.editReply({
        embeds: [buildEmbed()],
        components: [buildRow()],
      });
    });

    collector.on("end", () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        ...buildRow().components.map(b => b.setDisabled(true))
      );
      message.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
