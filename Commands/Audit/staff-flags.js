const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

/* ───────── CONSTANTS ───────── */
const COUNTED_ACTIONS = [
  "Warn",
  "Timeout",
  "Auto Timeout",
  "Kick",
  "Ban",
  "Unban",
];

const DAY = 24 * 60 * 60 * 1000;

/* ───────── DEFAULT THRESHOLDS ───────── */
const DEFAULT_THRESHOLDS = {
  spike24h: 6,
  spikeMultiplier: 3,
  warnOnly7d: 10,
  banRatio: 0.5,
  newStaff48h: 5,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff-flags")
    .setDescription("Staff activity monitoring & alerts")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    .addSubcommand(sub =>
      sub.setName("enable").setDescription("Enable staff monitoring")
    )
    .addSubcommand(sub =>
      sub.setName("disable").setDescription("Disable staff monitoring")
    )
    .addSubcommand(sub =>
      sub.setName("status").setDescription("View monitoring status")
    )
    .addSubcommand(sub =>
      sub.setName("history").setDescription("View staff alert history")
    )

    .addSubcommandGroup(group =>
      group
        .setName("config")
        .setDescription("Configure monitoring thresholds")
        .addSubcommand(sub =>
          sub.setName("view").setDescription("View current thresholds")
        )
        .addSubcommand(sub =>
          sub
            .setName("set")
            .setDescription("Update a threshold")
            .addStringOption(opt =>
              opt
                .setName("key")
                .setDescription("Threshold to change")
                .setRequired(true)
                .addChoices(
                  { name: "Spike actions (24h)", value: "spike24h" },
                  { name: "Spike multiplier", value: "spikeMultiplier" },
                  { name: "Warn-only (7d)", value: "warnOnly7d" },
                  { name: "Ban ratio", value: "banRatio" },
                  { name: "New staff actions (48h)", value: "newStaff48h" }
                )
            )
            .addNumberOption(opt =>
              opt
                .setName("value")
                .setDescription("New value")
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName("reset")
            .setDescription("Reset thresholds to default")
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    const settings = await getGuildSettings(guildId);

    /* ───────── ENSURE STRUCTURE ───────── */
    settings.staffMonitoring ??= {};
    settings.staffMonitoring.enabled ??= false;
    settings.staffMonitoring.alerts ??= [];
    settings.staffMonitoring.suppression ??= {};
    settings.staffMonitoring.thresholds ??= { ...DEFAULT_THRESHOLDS };

    /* ───────── STATUS ───────── */
    if (sub === "status") {
      const embed = new EmbedBuilder()
        .setTitle("🚨 Staff Monitoring Status")
        .setColor(settings.staffMonitoring.enabled ? "Green" : "Red")
        .addFields(
          {
            name: "Monitoring",
            value: settings.staffMonitoring.enabled ? "🟢 Enabled" : "🔴 Disabled",
            inline: true,
          },
          {
            name: "Stored Alerts",
            value: `${settings.staffMonitoring.alerts.length}`,
            inline: true,
          }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── ENABLE ───────── */
    if (sub === "enable") {
      await updateGuildSettings(guildId, {
        "staffMonitoring.enabled": true,
      });

      const embed = new EmbedBuilder()
        .setTitle("✅ Staff Monitoring Enabled")
        .setColor("Green")
        .setDescription("Staff activity monitoring is now active.")
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── DISABLE ───────── */
    if (sub === "disable") {
      await updateGuildSettings(guildId, {
        "staffMonitoring.enabled": false,
      });

      const embed = new EmbedBuilder()
        .setTitle("🛑 Staff Monitoring Disabled")
        .setColor("Red")
        .setDescription("Staff activity monitoring has been turned off.")
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── HISTORY ───────── */
    if (sub === "history") {
      const alerts = settings.staffMonitoring.alerts;

      if (!alerts.length) {
        const embed = new EmbedBuilder()
          .setTitle("🚨 Staff Alert History")
          .setColor("Grey")
          .setDescription("No staff activity alerts recorded yet.")
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      const recent = alerts.slice(-10).reverse();

      const embed = new EmbedBuilder()
        .setTitle("🚨 Staff Alert History")
        .setColor("Orange")
        .setDescription(
          recent
            .map(
              a =>
                `**${a.flag.toUpperCase()}** — ${a.moderatorTag}\n<t:${Math.floor(
                  new Date(a.createdAt).getTime() / 1000
                )}:R>`
            )
            .join("\n\n")
        )
        .setFooter({ text: `Showing last ${recent.length} alerts` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── CONFIG VIEW ───────── */
    if (group === "config" && sub === "view") {
      const t = settings.staffMonitoring.thresholds;

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Staff Monitoring Thresholds")
        .setColor("Blue")
        .addFields(
          {
            name: "📈 Spike Detection",
            value: [
              `• Actions (24h): **${t.spike24h}**`,
              `• Multiplier: **${t.spikeMultiplier}×**`,
            ].join("\n"),
          },
          {
            name: "⚠️ Patterns",
            value: [
              `• Warn-only (7d): **${t.warnOnly7d}**`,
              `• Ban ratio: **${Math.round(t.banRatio * 100)}%**`,
            ].join("\n"),
          },
          {
            name: "🆕 New Staff",
            value: `• Actions (48h): **${t.newStaff48h}**`,
          }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── CONFIG SET ───────── */
    if (group === "config" && sub === "set") {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Permission Denied")
          .setColor("Red")
          .setDescription("You need **Manage Server** to change thresholds.");

        return interaction.editReply({ embeds: [embed] });
      }

      const key = interaction.options.getString("key");
      const value = interaction.options.getNumber("value");

      if (value <= 0) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Invalid Value")
          .setColor("Red")
          .setDescription("Threshold values must be greater than zero.");

        return interaction.editReply({ embeds: [embed] });
      }

      settings.staffMonitoring.thresholds[key] = value;

      await updateGuildSettings(guildId, {
        "staffMonitoring.thresholds": settings.staffMonitoring.thresholds,
      });

      const embed = new EmbedBuilder()
        .setTitle("✅ Threshold Updated")
        .setColor("Green")
        .setDescription(`**${key}** set to **${value}**`)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── CONFIG RESET ───────── */
    if (group === "config" && sub === "reset") {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      ) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Permission Denied")
          .setColor("Red")
          .setDescription("You need **Manage Server** to reset thresholds.");

        return interaction.editReply({ embeds: [embed] });
      }

      await updateGuildSettings(guildId, {
        "staffMonitoring.thresholds": { ...DEFAULT_THRESHOLDS },
      });

      const embed = new EmbedBuilder()
        .setTitle("♻️ Thresholds Reset")
        .setColor("Green")
        .setDescription("All staff monitoring thresholds were reset to defaults.")
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── FALLBACK (SAFETY) ───────── */
    const embed = new EmbedBuilder()
      .setTitle("ℹ️ No Action Taken")
      .setColor("Grey")
      .setDescription("This command path is not implemented.")
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
