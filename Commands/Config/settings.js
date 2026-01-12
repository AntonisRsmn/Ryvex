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
          cmd
            .setName("disable")
            .setDescription("Disable separate moderation logs")
        )
    )

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
              opt
                .setName("role")
                .setDescription("Role to assign")
                .setRequired(true)
            )
        )
    ),

  async execute(interaction) {
    try {
      const guild = interaction.guild;
      const guildId = guild.id;

      const sub = interaction.options.getSubcommand();
      const group = interaction.options.getSubcommandGroup(false);

      /* ───────── VIEW ───────── */
      if (sub === "view") {
        const settings = await getGuildSettings(guildId);

        // defensive defaults
        settings.logging ??= {};
        settings.moderation ??= {};
        settings.welcome ??= {};

        if (typeof settings.logging.messageContent !== "boolean") {
          await updateGuildSettings(guildId, {
            "logging.messageContent": false,
          });
          settings.logging.messageContent = false;
        }

        const loggingChannel = settings.logging.channelId
          ? guild.channels.cache.get(settings.logging.channelId)
          : null;

        const moderationChannel =
          settings.moderation.enabled && settings.moderation.channelId
            ? guild.channels.cache.get(settings.moderation.channelId)
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
              name: "📄 General Logging",
              value: [
                `Enabled: **${settings.logging.enabled ? "Yes" : "No"}**`,
                `Channel: ${loggingChannel ?? "Not set"}`,
                `Privacy Mode: **${
                  settings.logging.messageContent
                    ? "OFF (content logged)"
                    : "ON (content hidden)"
                }**`,
              ].join("\n"),
            },
            {
              name: "🛡 Moderation Logs",
              value: [
                `Separate Channel: **${
                  settings.moderation.enabled ? "Yes" : "No"
                }**`,
                `Channel: ${moderationChannel ?? "Using general logs"}`,
              ].join("\n"),
            },
            {
              name: "👋 Welcome",
              value: [
                `Enabled: **${settings.welcome.enabled ? "Yes" : "No"}**`,
                `Channel: ${welcomeChannel ?? "Not set"}`,
                `Auto-role: ${autoRole ?? "Not set"}`,
              ].join("\n"),
            }
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        return respond(interaction, {
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder().setColor("White").setTimestamp();

      /* ───────── LOGGING ───────── */
      if (group === "logging") {
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

          if (mode === "status") {
            const fresh = await getGuildSettings(guildId);
            embed.setDescription(
              fresh.logging?.messageContent
                ? "🔓 **Privacy Mode: OFF**"
                : "🔒 **Privacy Mode: ON**"
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
      }

      /* ───────── MODERATION ───────── */
      if (group === "moderation") {
        if (sub === "channel") {
          const channel = interaction.options.getChannel("channel");
          await updateGuildSettings(guildId, {
            "moderation.channelId": channel.id,
            "moderation.enabled": true,
          });
          embed.setDescription(`🛡 Moderation logs channel set to ${channel}`);
        }

        if (sub === "disable") {
          await updateGuildSettings(guildId, {
            "moderation.channelId": null,
            "moderation.enabled": false,
          });
          embed.setDescription("🛡 Separate moderation logs disabled.");
        }
      }

      /* ───────── WELCOME ───────── */
      if (group === "welcome") {
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
      }

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error("Settings command failed:", err);

      return respond(interaction, {
        content: "❌ Failed to update or fetch settings.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
