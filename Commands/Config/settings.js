const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("View server configuration overview.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(cmd =>
      cmd.setName("view").setDescription("View current guild configuration")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const guild = interaction.guild;
      const settings = await getGuildSettings(guild.id);

      /* ───────── LOGGING ───────── */
      const loggingEnabled = settings.logging?.enabled === true;
      const loggingChannel = settings.logging?.channelId
        ? guild.channels.cache.get(settings.logging.channelId)
        : null;
      const loggingReady = loggingEnabled && Boolean(loggingChannel);

      const privacyMode =
        settings.logging?.messageContent === true ? "OFF" : "ON";

      /* ───────── MODERATION ───────── */
      const moderationEnabled = settings.moderation?.enabled === true;
      const moderationChannel =
        moderationEnabled && settings.moderation?.channelId
          ? guild.channels.cache.get(settings.moderation.channelId)
          : null;
      const moderationReady = moderationEnabled && Boolean(moderationChannel);

      /* ───────── WELCOME ───────── */
      const welcomeEnabled = settings.welcome?.enabled === true;
      const welcomeChannel =
        welcomeEnabled && settings.welcome?.channelId
          ? guild.channels.cache.get(settings.welcome.channelId)
          : null;
      const autoRole = settings.welcome?.autoRoleId
        ? guild.roles.cache.get(settings.welcome.autoRoleId)
        : null;
      const welcomeReady = welcomeEnabled && Boolean(welcomeChannel);

      /* ───────── AUTOMOD ───────── */
      const automod = settings.automod ?? {};
      const automodEnabled = automod.enabled === true;
      const activeFilters = [
        automod.spam,
        automod.links,
        automod.badWords,
      ].filter(Boolean).length;
      const automodReady = automodEnabled && activeFilters > 0;

      /* ───────── APPEALS ───────── */
      const appealsEnabled = settings.appeals?.enabled === true;

      /* ───────── STAFF MONITORING ───────── */
      const staffMonitoringEnabled =
        settings.staffMonitoring?.enabled === true;

      /* ───────── COLOR LOGIC ───────── */
      const systems = [
        loggingReady,
        moderationReady,
        welcomeReady,
        automodReady,
        appealsEnabled,
        staffMonitoringEnabled,
      ];

      const enabledCount = systems.filter(Boolean).length;

      let color = "Red";
      if (enabledCount === systems.length) color = "Green";
      else if (enabledCount > 0) color = "Orange";

      /* ───────── EMBED ───────── */
      const embed = new EmbedBuilder()
        .setTitle("⚙️ Server Configuration Overview")
        .setColor(color)
        .addFields(
          {
            name: "📜 Logging",
            value: [
              `Enabled: ${loggingEnabled ? "✅" : "❌"}`,
              `Channel: ${loggingChannel ?? "❌ Not set"}`,
              `Privacy mode: **${privacyMode}**`,
            ].join("\n"),
          },
          {
            name: "🛡 Moderation Logs",
            value: [
              `Enabled: ${moderationEnabled ? "✅" : "❌"}`,
              `Channel: ${moderationChannel ?? "❌ Not set"}`,
            ].join("\n"),
          },
          {
            name: "👋 Welcome System",
            value: [
              `Enabled: ${welcomeEnabled ? "✅" : "❌"}`,
              `Channel: ${welcomeChannel ?? "❌ Not set"}`,
              `Auto-role: ${autoRole ?? "Not set"}`,
            ].join("\n"),
          },
          {
            name: "🤖 AutoMod",
            value: [
              `Enabled: ${automodEnabled ? "✅" : "❌"}`,
              `Active filters: **${activeFilters}/3**`,
            ].join("\n"),
          },
          {
            name: "📨 Appeals",
            value: appealsEnabled ? "🟢 Enabled" : "🔴 Disabled",
            inline: true,
          },
          {
            name: "👮 Staff Monitoring",
            value: staffMonitoringEnabled ? "🟢 Enabled" : "🔴 Disabled",
            inline: true,
          }
        )
        .setFooter({ text: "Ryvex • Settings Overview" })
        .setTimestamp();

      return respond(interaction, { embeds: [embed] });
    } catch (err) {
      console.error("Settings command failed:", err);
      return respond(interaction, {
        content: "❌ Failed to retrieve server settings.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
