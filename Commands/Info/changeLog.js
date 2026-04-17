const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const changeLog = require("../../Data/changeLog");

/* ───────── HELPERS ───────── */
const CATEGORY_ICONS = {
  "✨": "Features",
  "🛡": "Security",
  "🛡️": "Security",
  "🔒": "Security",
  "🐛": "Bug Fixes",
  "⬆️": "Upgrades",
  "📦": "Deps",
  "🔄": "Improvements",
  "⚙️": "Config",
  "♻️": "Improvements",
  "🧹": "Cleanup",
  "🧠": "Stability",
};

function categoriseChange(text) {
  const first = [...text][0] + (text.codePointAt(0) > 0xffff ? [...text][1] ?? "" : "");
  for (const [icon, cat] of Object.entries(CATEGORY_ICONS)) {
    if (text.startsWith(icon)) return cat;
  }
  return "Other";
}

function relativeDate(dateStr) {
  const ts = Math.floor(new Date(dateStr).getTime() / 1000);
  return `<t:${ts}:R>`;
}

function daysBetween(a, b) {
  return Math.round(
    Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("View Ryvex update history")
    .addSubcommand(sub =>
      sub.setName("latest").setDescription("View the latest update")
    )
    .addSubcommand(sub =>
      sub.setName("all").setDescription("Browse all updates")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!changeLog.length) {
      return interaction.editReply("❌ No changelog data available.");
    }

    const sub = interaction.options.getSubcommand();

    /* ════════════════════════════════════════════════
       LATEST — rich 2-page view of the newest release
       ════════════════════════════════════════════════ */
    if (sub === "latest") {
      const latest = changeLog[0];
      const totalChanges = changeLog.reduce((s, e) => s + e.changes.length, 0);

      /* Categorise changes */
      const cats = {};
      for (const c of latest.changes) {
        const cat = categoriseChange(c);
        (cats[cat] ??= []).push(c);
      }

      /* Page 1 — Release overview */
      const page1 = new EmbedBuilder()
        .setTitle(`🚀 Ryvex v${latest.version}`)
        .setColor("Green")
        .setDescription(
          [
            `📅 **Released:** ${latest.date} (${relativeDate(latest.date)})`,
            `📝 **Changes in this release:** ${latest.changes.length}`,
            changeLog.length > 1
              ? `📊 **Total across ${changeLog.length} releases:** ${totalChanges} changes`
              : "",
            "",
            "───────────────────────",
            "",
            ...latest.changes.map(c => `> ${c}`),
          ]
            .filter(Boolean)
            .join("\n")
        )
        .setFooter({ text: "Ryvex • Use /changelog all to browse history" })
        .setTimestamp();

      /* Page 2 — Stats & summary (only if enough data) */
      if (changeLog.length >= 2) {
        const prev = changeLog[1];
        const gap = daysBetween(latest.date, prev.date);

        const catSummary = Object.entries(cats)
          .map(([cat, items]) => `> **${cat}:** ${items.length}`)
          .join("\n");

        const page2 = new EmbedBuilder()
          .setTitle("📊 Release Stats")
          .setColor("Blue")
          .setDescription(
            [
              "**This release**",
              `> Version: **v${latest.version}**`,
              `> Changes: **${latest.changes.length}**`,
              `> Released: ${latest.date} (${relativeDate(latest.date)})`,
              `> Days since previous: **${gap}**`,
              "",
              "**Changes by category**",
              catSummary,
              "",
              "**Previous release**",
              `> v${prev.version} — ${prev.date} (${prev.changes.length} changes)`,
              "",
              "**Project lifetime**",
              `> First release: v${changeLog[changeLog.length - 1].version} (${changeLog[changeLog.length - 1].date})`,
              `> Total releases: **${changeLog.length}**`,
              `> Total changes: **${totalChanges}**`,
            ].join("\n")
          )
          .setFooter({ text: "Ryvex • Release Stats" })
          .setTimestamp();

        let page = 0;
        const pages = [page1, page2];

        const buildRow = () =>
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("clog_prev")
              .setLabel("◀ Changes")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("clog_next")
              .setLabel("Stats ▶")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
          );

        const message = await interaction.editReply({
          embeds: [pages[page]],
          components: [buildRow()],
        });

        const collector = message.createMessageComponentCollector({
          time: 120_000,
        });

        collector.on("collect", async i => {
          if (i.user.id !== interaction.user.id)
            return i.reply({ content: "❌ This menu isn't for you.", ephemeral: true });

          await i.deferUpdate().catch(() => {});
          if (i.customId === "clog_prev") page = 0;
          if (i.customId === "clog_next") page = 1;

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

        return;
      }

      /* Single release — no pagination needed */
      return interaction.editReply({ embeds: [page1] });
    }

    /* ════════════════════════════════════════════════
       ALL — browse every release with rich formatting
       ════════════════════════════════════════════════ */
    let page = 0;
    const totalPages = changeLog.length + 1; // +1 for overview page
    const totalChanges = changeLog.reduce((s, e) => s + e.changes.length, 0);

    const buildEmbed = () => {
      /* Page 0 — Overview / timeline */
      if (page === 0) {
        const timeline = changeLog
          .slice(0, 8)
          .map((e, idx) => {
            const marker = idx === 0 ? "🟢" : "⚪";
            return `${marker} **v${e.version}** — ${e.date} (${e.changes.length} changes)`;
          });

        if (changeLog.length > 8) {
          timeline.push(`> ...and ${changeLog.length - 8} older releases`);
        }

        return new EmbedBuilder()
          .setTitle("📜 Ryvex Changelog")
          .setColor("Blue")
          .setThumbnail(interaction.client.user.displayAvatarURL({ size: 128 }))
          .setDescription(
            [
              `Browse the full update history of **Ryvex**.`,
              "",
              `📊 **${changeLog.length}** releases • **${totalChanges}** total changes`,
              `📅 First: **v${changeLog[changeLog.length - 1].version}** (${changeLog[changeLog.length - 1].date})`,
              `🚀 Latest: **v${changeLog[0].version}** (${changeLog[0].date})`,
              "",
              "**Release Timeline**",
              ...timeline,
              "",
              "Use ◀ ▶ to browse each release.",
            ].join("\n")
          )
          .setFooter({
            text: `Ryvex • Changelog Overview • Page 1/${totalPages}`,
          })
          .setTimestamp();
      }

      /* Pages 1+ — individual releases */
      const entry = changeLog[page - 1];
      const prev = changeLog[page] ?? null;
      const gap = prev ? daysBetween(entry.date, prev.date) : null;

      const header = [
        `📅 **Released:** ${entry.date} (${relativeDate(entry.date)})`,
        `📝 **Changes:** ${entry.changes.length}`,
      ];
      if (gap !== null) header.push(`⏱️ **Days since previous:** ${gap}`);
      header.push("", "───────────────────────", "");

      return new EmbedBuilder()
        .setTitle(`🚀 v${entry.version}`)
        .setColor(page === 1 ? "Green" : "Blue")
        .setDescription(
          [...header, ...entry.changes.map(c => `> ${c}`)].join("\n")
        )
        .setFooter({
          text: `Ryvex • Release ${page}/${changeLog.length} • Page ${page + 1}/${totalPages}`,
        })
        .setTimestamp();
    };

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("clall_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("clall_next")
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
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "❌ This menu isn't for you.", ephemeral: true });

      await i.deferUpdate().catch(() => {});

      if (i.customId === "clall_prev") page--;
      if (i.customId === "clall_next") page++;
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
