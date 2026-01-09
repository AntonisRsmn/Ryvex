const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure guild settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ───────── VIEW ─────────
    .addSubcommand(cmd =>
      cmd
        .setName("view")
        .setDescription("View current guild settings")
    )

    // ───────── LOGGING ─────────
    .addSubcommandGroup(group =>
      group
        .setName("logging")
        .setDescription("Logging settings")
        .addSubcommand(cmd =>
          cmd
            .setName("enable")
            .setDescription("Enable logging")
        )
        .addSubcommand(cmd =>
          cmd
            .setName("disable")
            .setDescription("Disable logging")
        )
        .addSubcommand(cmd =>
          cmd
            .setName("channel")
            .setDescription("Set logging channel")
            .addChannelOption(opt =>
              opt
                .setName("channel")
                .setDescription("Log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
    )

    // ───────── WELCOME ─────────
    .addSubcommandGroup(group =>
      group
        .setName("welcome")
        .setDescription("Welcome system settings")
        .addSubcommand(cmd =>
          cmd
            .setName("enable")
            .setDescription("Enable welcome messages")
        )
        .addSubcommand(cmd =>
          cmd
            .setName("disable")
            .setDescription("Disable welcome messages")
        )
        .addSubcommand(cmd =>
          cmd
            .setName("channel")
            .setDescription("Set welcome channel")
            .addChannelOption(opt =>
              opt
                .setName("channel")
                .setDescription("Welcome channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand(cmd =>
          cmd
            .setName("autorole")
            .setDescription("Set auto-role for new members")
            .addRoleOption(opt =>
              opt
                .setName("role")
                .setDescription("Role to assign")
                .setRequired(true)
            )
        )
    ),

  async execute(interaction) {
    // Always defer (DB access + safety)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    const guildId = guild.id;

    const sub = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    // ───────── VIEW HANDLER ─────────
    if (sub === "view") {
      const settings = await getGuildSettings(guildId);

      const loggingChannel = settings.logging.channelId
        ? guild.channels.cache.get(settings.logging.channelId)
        : null;

      const welcomeChannel = settings.welcome.channelId
        ? guild.channels.cache.get(settings.welcome.channelId)
        : null;

      const autoRole = settings.welcome.autoRoleId
        ? guild.roles.cache.get(settings.welcome.autoRoleId)
        : null;

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Guild Settings")
        .setColor("White")
        .addFields(
          {
            name: "📄 Logging",
            value: [
              `Enabled: **${settings.logging.enabled ? "Yes" : "No"}**`,
              `Channel: ${loggingChannel ?? "Not set"}`
            ].join("\n"),
            inline: false,
          },
          {
            name: "👋 Welcome",
            value: [
              `Enabled: **${settings.welcome.enabled ? "Yes" : "No"}**`,
              `Channel: ${welcomeChannel ?? "Not set"}`,
              `Auto-role: ${autoRole ?? "Not set"}`
            ].join("\n"),
            inline: false,
          },
          {
            name: "🛡 Moderation",
            value: `Action logging: **${settings.moderation.logActions ? "Enabled" : "Disabled"}**`,
            inline: false,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor("White")
      .setTimestamp();

    // ───────── LOGGING HANDLERS ─────────
    if (group === "logging") {
      if (sub === "enable") {
        await updateGuildSettings(guildId, {
          "logging.enabled": true,
        });
        embed.setDescription("✅ Logging enabled.");
      }

      if (sub === "disable") {
        await updateGuildSettings(guildId, {
          "logging.enabled": false,
        });
        embed.setDescription("❌ Logging disabled.");
      }

      if (sub === "channel") {
        const channel = interaction.options.getChannel("channel");

        await updateGuildSettings(guildId, {
          "logging.channelId": channel.id,
          "logging.enabled": true,
        });

        embed.setDescription(`📄 Logging channel set to ${channel}.`);
      }
    }

    // ───────── WELCOME HANDLERS ─────────
    if (group === "welcome") {
      if (sub === "enable") {
        await updateGuildSettings(guildId, {
          "welcome.enabled": true,
        });
        embed.setDescription("👋 Welcome system enabled.");
      }

      if (sub === "disable") {
        await updateGuildSettings(guildId, {
          "welcome.enabled": false,
        });
        embed.setDescription("👋 Welcome system disabled.");
      }

      if (sub === "channel") {
        const channel = interaction.options.getChannel("channel");

        await updateGuildSettings(guildId, {
          "welcome.channelId": channel.id,
          "welcome.enabled": true,
        });

        embed.setDescription(`👋 Welcome channel set to ${channel}.`);
      }

      if (sub === "autorole") {
        const role = interaction.options.getRole("role");

        await updateGuildSettings(guildId, {
          "welcome.autoRoleId": role.id,
          "welcome.enabled": true,
        });

        embed.setDescription(`🎭 Auto-role set to ${role}.`);
      }
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
