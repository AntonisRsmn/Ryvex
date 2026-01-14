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
    .setName("settings")
    .setDescription("Configure guild settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(cmd =>
      cmd.setName("view").setDescription("View current guild settings")
    )

    /* ───────── LOGGING ───────── */
    .addSubcommandGroup(group =>
      group
        .setName("logging")
        .setDescription("General logging settings")
        .addSubcommand(cmd =>
          cmd.setName("enable").setDescription("Enable logging")
        )
        .addSubcommand(cmd =>
          cmd.setName("disable").setDescription("Disable logging")
        )
        .addSubcommand(cmd =>
          cmd
            .setName("channel")
            .setDescription("Set general log channel")
            .addChannelOption(opt =>
              opt
                .setName("channel")
                .setDescription("Log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand(cmd =>
          cmd
            .setName("privacy")
            .setDescription("Configure message content privacy")
            .addStringOption(opt =>
              opt
                .setName("mode")
                .setDescription("Privacy mode")
                .setRequired(true)
                .addChoices(
                  { name: "ON (hide message content)", value: "on" },
                  { name: "OFF (log message content)", value: "off" },
                  { name: "Status", value: "status" }
                )
            )
        )
    )

    /* ───────── MODERATION ───────── */
    .addSubcommandGroup(group =>
      group
        .setName("moderation")
        .setDescription("Moderation logging settings")
        .addSubcommand(cmd =>
          cmd
            .setName("channel")
            .setDescription("Set moderation log channel")
            .addChannelOption(opt =>
              opt
                .setName("channel")
                .setDescription("Moderation log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand(cmd =>
          cmd.setName("disable").setDescription("Disable separate moderation logs")
        )
    )

    /* ───────── WELCOME ───────── */
    .addSubcommandGroup(group =>
      group
        .setName("welcome")
        .setDescription("Welcome system settings")
        .addSubcommand(cmd =>
          cmd.setName("enable").setDescription("Enable welcome messages")
        )
        .addSubcommand(cmd =>
          cmd.setName("disable").setDescription("Disable welcome messages")
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
              opt.setName("role").setDescription("Role to assign").setRequired(true)
            )
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const guild = interaction.guild;
      const guildId = guild.id;
      const sub = interaction.options.getSubcommand();
      const group = interaction.options.getSubcommandGroup(false);

      /* ───────── VIEW ───────── */
      /* ───────── VIEW ───────── */
if (sub === "view") {
  const settings = await getGuildSettings(guildId);

  const loggingEnabled = settings.logging?.enabled === true;
  const loggingChannel = settings.logging?.channelId
    ? guild.channels.cache.get(settings.logging.channelId)
    : null;

  const privacyMode =
    settings.logging?.messageContent === true ? "OFF" : "ON";

  const modEnabled = settings.moderation?.enabled === true;
  const modChannel =
    modEnabled && settings.moderation?.channelId
      ? guild.channels.cache.get(settings.moderation.channelId)
      : null;

  const welcomeEnabled = settings.welcome?.enabled === true;
  const welcomeChannel = settings.welcome?.channelId
    ? guild.channels.cache.get(settings.welcome.channelId)
    : null;

  const autoRole = settings.welcome?.autoRoleId
    ? guild.roles.cache.get(settings.welcome.autoRoleId)
    : null;

  const requiredOk = loggingEnabled && loggingChannel;

  const embed = new EmbedBuilder()
    .setTitle("⚙️ Server Configuration Overview")
    .setColor(requiredOk ? "Green" : "Orange")
    .setDescription(
      requiredOk
        ? "✅ **Required configuration complete**"
        : "⚠️ **Required configuration incomplete**"
    )
    .addFields(
      {
        name: "🚨 Required",
        value: [
          `Logging enabled: ${loggingEnabled ? "✅" : "❌"}`,
          `Log channel: ${loggingChannel ?? "❌ Not set"}`,
        ].join("\n"),
      },
      {
        name: "🛡 Moderation Logs",
        value: [
          `Separate channel: ${modEnabled ? "✅" : "❌"}`,
          `Channel: ${modChannel ?? "Using general logs"}`,
        ].join("\n"),
      },
      {
        name: "👋 Welcome System",
        value: [
          `Enabled: ${welcomeEnabled ? "✅" : "❌"}`,
          `Channel: ${welcomeChannel ?? "Not set"}`,
          `Auto-role: ${autoRole ?? "Not set"}`,
        ].join("\n"),
      },
      {
        name: "🔐 Privacy",
        value: `Message content logging: **${privacyMode}**`,
      }
    )
    .setFooter({ text: "Ryvex • Settings Overview" })
    .setTimestamp();

  const row = {
    type: 1,
    components: [
      {
        type: 2,
        style: 2,
        label: "Enable Logging",
        custom_id: "settings_logging_enable",
        disabled: loggingEnabled,
      },
      {
        type: 2,
        style: 2,
        label: "Set Log Channel",
        custom_id: "settings_logging_channel",
      },
      {
        type: 2,
        style: 2,
        label: "Privacy Status",
        custom_id: "settings_logging_privacy",
      },
    ],
  };

  return respond(interaction, {
    embeds: [embed],
    components: [row],
  });
}


      /* ───────── LOGGING ───────── */
      if (group === "logging") {
        const embed = new EmbedBuilder().setColor("White").setTimestamp();

        if (sub === "enable") {
          await updateGuildSettings(guildId, { "logging.enabled": true });
          embed.setDescription("✅ Logging enabled.");
        }

        if (sub === "disable") {
          await updateGuildSettings(guildId, { "logging.enabled": false });
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

        if (sub === "privacy") {
          const mode = interaction.options.getString("mode");

          if (!mode) {
            return respond(interaction, {
              content:
                "❌ Please choose a privacy mode.\nUse: `/settings logging privacy <on|off|status>`",
            });
          }

          if (mode === "status") {
            const fresh = await getGuildSettings(guildId);
            embed.setDescription(
              fresh.logging?.messageContent
                ? "🔓 **Privacy Mode: OFF** (content is logged)"
                : "🔒 **Privacy Mode: ON** (content is hidden)"
            );
          }

          if (mode === "on") {
            await updateGuildSettings(guildId, {
              "logging.messageContent": false,
            });
            embed.setDescription("🔒 Privacy Mode enabled.");
          }

          if (mode === "off") {
            await updateGuildSettings(guildId, {
              "logging.messageContent": true,
            });
            embed.setDescription("🔓 Privacy Mode disabled.");
          }
        }

        return respond(interaction, { embeds: [embed] });
      }

      /* ───────── MODERATION ───────── */
      if (group === "moderation") {
        const embed = new EmbedBuilder().setColor("White").setTimestamp();

        if (sub === "channel") {
          const channel = interaction.options.getChannel("channel");
          await updateGuildSettings(guildId, {
            "moderation.enabled": true,
            "moderation.channelId": channel.id,
          });
          embed.setDescription(`🛡 Moderation log channel set to ${channel}.`);
        }

        if (sub === "disable") {
          await updateGuildSettings(guildId, {
            "moderation.enabled": false,
            "moderation.channelId": null,
          });
          embed.setDescription("🛡 Separate moderation logs disabled.");
        }

        return respond(interaction, { embeds: [embed] });
      }

      /* ───────── WELCOME ───────── */
      if (group === "welcome") {
        const embed = new EmbedBuilder().setColor("White").setTimestamp();

        if (sub === "enable") {
          await updateGuildSettings(guildId, { "welcome.enabled": true });
          embed.setDescription("👋 Welcome system enabled.");
        }

        if (sub === "disable") {
          await updateGuildSettings(guildId, { "welcome.enabled": false });
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

        return respond(interaction, { embeds: [embed] });
      }
    } catch (err) {
      console.error("Settings command failed:", err);
      return respond(interaction, {
        content: "❌ Failed to update or fetch settings.",
      });
    }
  },
};
