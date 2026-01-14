const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Guided setup and status overview for Ryvex.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const settings = await getGuildSettings(guildId);

    /* ───────── STATUS HELPERS ───────── */
    const yesNo = v => (v ? "✅ Yes" : "❌ No");
    const setUnset = v => (v ? "✅ Set" : "❌ Not set");

    const loggingEnabled = settings.logging?.enabled === true;
    const loggingChannelSet = Boolean(settings.logging?.channelId);
    const moderationEnabled = settings.moderation?.enabled === true;
    const moderationChannelSet = Boolean(settings.moderation?.channelId);
    const privacyMode =
      settings.logging?.messageContent === true ? "🔓 OFF" : "🔒 ON";
    const welcomeEnabled = settings.welcome?.enabled === true;

    /* ───────── VISUAL STATUS ───────── */
    const loggingStatus =
      loggingEnabled && loggingChannelSet
        ? "✅ Fully configured"
        : loggingEnabled
        ? "⚠️ Enabled, channel missing"
        : "❌ Not configured";

    const moderationStatus =
      moderationEnabled && moderationChannelSet
        ? "✅ Fully configured"
        : moderationEnabled
        ? "⚠️ Enabled, channel missing"
        : "❌ Not configured";

    /* ───────── PAGES ───────── */
    const pages = [
      new EmbedBuilder()
        .setTitle("🚀 Ryvex — Setup Overview")
        .setColor("Blue")
        .setDescription(
          [
            "Welcome to **Ryvex** 👋",
            "",
            "This guide helps you:",
            "• Verify what’s already configured",
            "• See what is **required** vs **optional**",
            "• Know exactly what to do next",
            "",
            "You only need to complete setup **once per server**.",
          ].join("\n")
        ),

      new EmbedBuilder()
        .setTitle("🧩 Current Setup Status")
        .setColor("Purple")
        .setDescription(
          [
            "**Logging**",
            `• Status: **${loggingStatus}**`,
            "",
            "**Moderation Logs**",
            `• Status: **${moderationStatus}**`,
            "",
            "**Privacy**",
            `• Message content logging: ${privacyMode}`,
            "",
            "**Welcome System**",
            `• Enabled: ${yesNo(welcomeEnabled)}`,
          ].join("\n")
        )
        .setFooter({ text: "Red ❌ = required action missing" }),

      new EmbedBuilder()
        .setTitle("🔴 Required Setup")
        .setColor("Red")
        .setDescription(
          [
            "**You must complete these steps:**",
            "",
            "1️⃣ Enable logging",
            "`/settings logging enable`",
            "",
            "2️⃣ Set a log channel",
            "`/settings logging channel <channel>`",
            "",
            "> Without this, Ryvex **cannot log events**.",
          ].join("\n")
        ),

      new EmbedBuilder()
        .setTitle("🟡 Recommended Setup")
        .setColor("Orange")
        .setDescription(
          [
            "**Strongly recommended:**",
            "",
            "• Separate moderation logs",
            "`/settings moderation channel <channel>`",
            "",
            "• Privacy mode",
            "`/settings logging privacy on | off`",
            "",
            "> Privacy mode is **ON by default**.",
          ].join("\n")
        ),

      new EmbedBuilder()
        .setTitle("🛡️ Moderation & Case System")
        .setColor("DarkRed")
        .setDescription(
          [
            "Every moderation action creates a **case**.",
            "",
            "Examples:",
            "• `/warn add`",
            "• `/timeout`",
            "• `/kick`",
            "• `/ban`",
            "",
            "Review cases:",
            "• `/case view <id>`",
            "• `/modlog user <member>`",
          ].join("\n")
        ),

      new EmbedBuilder()
        .setTitle("👋 Optional Systems")
        .setColor("White")
        .setDescription(
          [
            "**Welcome system**",
            "`/settings welcome enable`",
            "`/settings welcome channel <channel>`",
            "`/settings welcome autorole <role>`",
            "",
            "Optional features do **not** affect logging.",
          ].join("\n")
        ),

      new EmbedBuilder()
        .setTitle("✅ When Is Setup Complete?")
        .setColor("Green")
        .setDescription(
          [
            "Setup is complete when:",
            "",
            "☑ Logging is enabled",
            "☑ At least one log channel is set",
            "☑ Ryvex has required permissions",
            "",
            "You can re-run `/setup` anytime.",
          ].join("\n")
        ),
    ];

    let page = 0;

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1),

        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("✖ Close")
          .setStyle(ButtonStyle.Danger)
      );

    const applyFooter = () => {
      pages[page].setFooter({
        text: `Page ${page + 1} / ${pages.length}`,
      });
    };

    applyFooter();

    const message = await interaction.editReply({
      embeds: [pages[page]],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This setup menu isn’t for you.",
          ephemeral: true,
        });
      }

      if (!i.deferred && !i.replied) {
        await i.deferUpdate().catch(() => {});
      }

      if (i.customId === "close") {
        collector.stop("closed");
        return;
      }

      if (i.customId === "prev" && page > 0) page--;
      if (i.customId === "next" && page < pages.length - 1) page++;

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

      await interaction.editReply({
        components: [disabledRow],
      }).catch(() => {});
    });
  },
};
