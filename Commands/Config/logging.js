const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logging")
    .setDescription("Configure general server logging.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub.setName("enable").setDescription("Enable server logging")
    )
    .addSubcommand(sub =>
      sub.setName("disable").setDescription("Disable server logging")
    )
    .addSubcommand(sub =>
      sub
        .setName("channel")
        .setDescription("Set the log channel")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Log channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("privacy")
        .setDescription("Configure message content privacy")
        .addStringOption(opt =>
          opt
            .setName("mode")
            .setDescription("Privacy mode")
            .setRequired(true)
            .addChoices(
              { name: "🔒 ON (hide content)", value: "on" },
              { name: "🔓 OFF (log content)", value: "off" },
              { name: "ℹ Status", value: "status" }
            )
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const embed = new EmbedBuilder()
      .setTitle("📄 Logging Settings")
      .setColor("White")
      .setTimestamp();

    if (sub === "enable") {
      await updateGuildSettings(guildId, { "logging.enabled": true });
      embed.setDescription("✅ General logging has been **enabled**.");
    }

    if (sub === "disable") {
      await updateGuildSettings(guildId, { "logging.enabled": false });
      embed.setDescription("❌ General logging has been **disabled**.");
    }

    if (sub === "channel") {
      const channel = interaction.options.getChannel("channel");
      await updateGuildSettings(guildId, {
        "logging.channelId": channel.id,
        "logging.enabled": true,
      });
      embed.setDescription(`📄 Log channel set to ${channel}.`);
    }

    if (sub === "privacy") {
      const mode = interaction.options.getString("mode");

      if (mode === "status") {
        const fresh = await getGuildSettings(guildId);
        embed.setDescription(
          fresh.logging?.messageContent
            ? "🔓 **Privacy OFF** — message content is logged."
            : "🔒 **Privacy ON** — message content is hidden."
        );
      }

      if (mode === "on") {
        await updateGuildSettings(guildId, {
          "logging.messageContent": false,
        });
        embed.setDescription("🔒 Privacy mode **enabled**.");
      }

      if (mode === "off") {
        await updateGuildSettings(guildId, {
          "logging.messageContent": true,
        });
        embed.setDescription("🔓 Privacy mode **disabled**.");
      }
    }

    return respond(interaction, { embeds: [embed] });
  },
};
