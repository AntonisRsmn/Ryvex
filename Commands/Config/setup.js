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
    .setDescription("Complete setup & configuration guide for Ryvex")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const settings = await getGuildSettings(interaction.guild.id);

    /* ───────── HELPERS ───────── */
    const yesNo = v => (v ? "✅ Yes" : "❌ No");
    const onOff = v => (v ? "🟢 ON" : "🔴 OFF");
    const count = v => (Array.isArray(v) ? v.length : 0);

    /* ───────── LOGGING STATUS ───────── */
    const loggingEnabled = settings.logging?.enabled === true;
    const loggingChannel = settings.logging?.channelId;
    const loggingReady = loggingEnabled && Boolean(loggingChannel);

    /* ───────── MODERATION STATUS ───────── */
    const moderationEnabled = settings.moderation?.enabled === true;
    const moderationChannel = settings.moderation?.channelId;
    const moderationReady =
      moderationEnabled && Boolean(moderationChannel);

    /* ───────── WELCOME STATUS ───────── */
    const welcomeEnabled = settings.welcome?.enabled === true;
    const welcomeChannel = settings.welcome?.channelId;
    const autoRoleId = settings.welcome?.autoRoleId;

    /* ───────── RULES STATUS (NEW) ───────── */
    const rulesConfigured = Array.isArray(settings.rules) && settings.rules.length > 0;

    /* ───────── APPEALS STATUS ───────── */
    const appeals = settings.appeals ?? {};
    const appealsEnabled = appeals.enabled === true;
    const appealsChannel = appeals.channelId;
    const appealsCooldownHours = appeals.cooldownMs
      ? Math.round(appeals.cooldownMs / (60 * 60 * 1000))
      : "—";

    const appealsReady = appealsEnabled;

    /* ───────── AUTOMOD STATUS ───────── */
    const automod = settings.automod ?? {};
    const automodEnabled = automod.enabled === true;

    const filtersEnabled = {
      spam: automod.spam === true,
      links: automod.links === true,
      badWords: automod.badWords === true,
    };

    const activeFiltersCount =
      Object.values(filtersEnabled).filter(Boolean).length;

    const automodReady =
      automodEnabled && activeFiltersCount > 0;

    /* ───────── STAFF MONITORING STATUS ───────── */
    const staffMonitoringEnabled =
      settings.staffMonitoring?.enabled === true;

    const staffAlertsCount =
      settings.staffMonitoring?.alerts?.length ?? 0;

    /* ───────── PAGES ───────── */
    const pages = [
      /* ───── PAGE 1: INTRO ───── */
      new EmbedBuilder()
        .setTitle("🚀 Ryvex — Complete Setup Guide")
        .setColor("Blue")
        .setDescription(
          [
            "Welcome to **Ryvex** 👋",
            "",
            "This guide shows:",
            "• ✅ What is configured",
            "• ⚠️ What needs attention",
            "• 🧭 Exactly what commands to run",
            "",
            "**This is a read-only guide.**",
            "Nothing is changed automatically.",
          ].join("\n")
        ),

      /* ───── PAGE 2: LOGGING ───── */
      new EmbedBuilder()
        .setTitle("📜 Logging System")
        .setColor(loggingReady ? "Green" : "Red")
        .setDescription(
          [
            "**Purpose**",
            "Logs server activity (messages, joins, deletes, edits).",
            "",
            "**Current Settings**",
            `• Enabled: ${yesNo(loggingEnabled)}`,
            `• Log channel: ${
              loggingChannel ? `<#${loggingChannel}>` : "❌ Not set"
            }`,
            `• Message content logging: ${
              settings.logging?.messageContent
                ? "🔓 OFF"
                : "🔒 ON (privacy)"
            }`,
            "",
            loggingReady
              ? "✅ **Logging is fully configured**"
              : "❌ **Logging is required for Ryvex to function properly**",
            "",
            "**Commands**",
            "`/logging enable`",
            "`/logging channel <channel>`",
          ].join("\n")
        ),

      /* ───── PAGE 3: MODERATION LOGS ───── */
      new EmbedBuilder()
        .setTitle("🛡 Moderation Logs")
        .setColor(moderationReady ? "Green" : "Orange")
        .setDescription(
          [
            "**Purpose**",
            "Tracks moderation actions and AutoMod punishments.",
            "",
            "**Current Settings**",
            `• Enabled: ${yesNo(moderationEnabled)}`,
            `• Channel: ${
              moderationChannel ? `<#${moderationChannel}>` : "❌ Not set"
            }`,
            "",
            moderationReady
              ? "✅ **Moderation logs are configured**"
              : "⚠️ **Strongly recommended**",
            "",
            "**Command**",
            "`/moderation channel <channel>`",
          ].join("\n")
        ),

      /* ───── PAGE 4: WELCOME SYSTEM ───── */
      new EmbedBuilder()
        .setTitle("👋 Welcome System")
        .setColor(welcomeEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**Purpose**",
            "Welcomes new members and optionally assigns a role.",
            "",
            "**Current Settings**",
            `• Enabled: ${yesNo(welcomeEnabled)}`,
            `• Channel: ${
              welcomeChannel ? `<#${welcomeChannel}>` : "❌ Not set"
            }`,
            `• Auto-role: ${autoRoleId ? `<@&${autoRoleId}>` : "Not set"}`,
            "",
            welcomeEnabled
              ? "✅ **Welcome system is active**"
              : "⚠️ **Welcome system is disabled**",
            "",
            "**Commands**",
            "`/welcome enable`",
            "`/welcome channel <channel>`",
            "`/welcome autorole <role>`",
          ].join("\n")
        ),

      /* ───── PAGE 5: RULES (NEW) ───── */
      new EmbedBuilder()
        .setTitle("📜 Server Rules")
        .setColor(rulesConfigured ? "Green" : "Orange")
        .setDescription(
          [
            "**Purpose**",
            "Defines server rules used for moderation clarity, AutoMod context, and appeals.",
            "",
            "**Current Status**",
            `• Rules configured: ${yesNo(rulesConfigured)}`,
            "",
            rulesConfigured
              ? "✅ **Rules are set and visible to members**"
              : "⚠️ **No rules configured yet**",
            "",
            "**Commands**",
            "`/rules` — View server rules",
            "`/rules-admin add`",
            "`/rules-admin edit`",
            "`/rules-admin remove`",
          ].join("\n")
        ),

      /* ───── PAGE 6: APPEALS ───── */
      new EmbedBuilder()
        .setTitle("📨 Appeals System")
        .setColor(appealsReady ? "Green" : "Orange")
        .setDescription(
          [
            "**Purpose**",
            "Allows members to appeal moderation actions privately.",
            "",
            "**Current Settings**",
            `• Enabled: ${yesNo(appealsEnabled)}`,
            `• Channel: ${
              appealsChannel ? `<#${appealsChannel}>` : "Auto-created"
            }`,
            `• Cooldown: ${appealsCooldownHours} hour(s)`,
            "",
            appealsReady
              ? "✅ **Appeals are available to members**"
              : "⚠️ **Appeals are currently disabled**",
            "",
            "**Commands**",
            "`/appeal`",
            "`/appeal-admin config`",
            "`/appeal-admin close`",
            "`/appeal-admin reopen`",
          ].join("\n")
        ),

      /* ───── PAGE 7: AUTOMOD CORE ───── */
      new EmbedBuilder()
        .setTitle("🤖 AutoMod — Core System")
        .setColor(
          automodReady ? "Green" : automodEnabled ? "Orange" : "Red"
        )
        .setDescription(
          [
            "**Purpose**",
            "Automatically enforces rules without moderator intervention.",
            "",
            "**Core Status**",
            `• AutoMod enabled: ${yesNo(automodEnabled)}`,
            `• Active filters: **${activeFiltersCount} / 3**`,
            "",
            automodReady
              ? "✅ **AutoMod is actively protecting the server**"
              : automodEnabled
              ? "⚠️ **AutoMod is enabled but filters are missing**"
              : "❌ **AutoMod is disabled**",
            "",
            "**Commands**",
            "`/automod enable`",
            "`/automod preset <medium>` *(recommended)*",
          ].join("\n")
        ),

      /* ───── PAGE 8: AUTOMOD DETAILS ───── */
      new EmbedBuilder()
        .setTitle("⚙️ AutoMod — Detailed Configuration")
        .setColor("Purple")
        .setDescription(
          [
            "**Filters**",
            `🚫 Spam: ${onOff(filtersEnabled.spam)}`,
            `🔗 Links: ${onOff(filtersEnabled.links)}`,
            `🤬 Bad Words: ${onOff(filtersEnabled.badWords)}`,
            "",
            "**Punishments**",
            `• Enabled: ${yesNo(automod.punishments?.enabled)}`,
            `• Warn-only: ${yesNo(automod.punishments?.warnOnly)}`,
            `• Timeout after: ${automod.punishments?.timeoutAfter ?? "—"} warns`,
            "",
            "**Bypasses**",
            `• Ignored channels: ${count(automod.channels?.ignored)}`,
            `• Spam-disabled channels: ${count(automod.channels?.spamDisabled)}`,
            `• Link-allowed channels: ${count(automod.channels?.linksAllowed)}`,
            `• Bad-word-disabled channels: ${count(automod.channels?.badWordsDisabled)}`,
            "",
            "**Commands**",
            "`/automod filters`",
            "`/automod-punishment view`",
            "`/automod-roles view`",
          ].join("\n")
        ),

      /* ───── PAGE 9: STAFF MONITORING ───── */
      new EmbedBuilder()
        .setTitle("🧑‍⚖️ Staff Monitoring")
        .setColor(staffMonitoringEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**Purpose**",
            "Provides accountability and detects unusual staff behavior.",
            "",
            "**Current Status**",
            `• Enabled: ${yesNo(staffMonitoringEnabled)}`,
            `• Alerts recorded: **${staffAlertsCount}**`,
            "",
            "**Commands**",
            "`/staff dashboard`",
            "`/staff-flags enable`",
            "`/staff-flags check`",
          ].join("\n")
        ),

      /* ───── PAGE 10: FINAL CHECK ───── */
      new EmbedBuilder()
        .setTitle("✅ Setup Completion Checklist")
        .setColor("Green")
        .setDescription(
          [
            "**Your server is fully ready when:**",
            "",
            `☑ Logging ready: ${yesNo(loggingReady)}`,
            `☑ Moderation logs set: ${yesNo(moderationReady)}`,
            `☑ Welcome system enabled: ${yesNo(welcomeEnabled)}`,
            `☑ Rules configured: ${yesNo(rulesConfigured)}`,
            `☑ Appeals enabled: ${yesNo(appealsReady)}`,
            `☑ AutoMod active: ${yesNo(automodReady)}`,
            `☑ Staff monitoring enabled: ${yesNo(staffMonitoringEnabled)}`,
            "",
            "You can safely re-run `/setup` anytime.",
          ].join("\n")
        ),
    ];

    /* ───────── NAVIGATION (UNCHANGED) ───────── */
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

    const applyFooter = () =>
      pages[page].setFooter({
        text: `Page ${page + 1} / ${pages.length}`,
      });

    applyFooter();

    const msg = await interaction.editReply({
      embeds: [pages[page]],
      components: [buildRow()],
    });

    const collector = msg.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This setup menu isn’t for you.",
          ephemeral: true,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "close") return collector.stop();
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
      await interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  },
};
