const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const {
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure the welcome system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName("enable").setDescription("Enable welcome messages")
    )
    .addSubcommand(sub =>
      sub.setName("disable").setDescription("Disable welcome messages")
    )
    .addSubcommand(sub =>
      sub
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
    .addSubcommand(sub =>
      sub
        .setName("message")
        .setDescription("Set custom welcome message. Use <username> for the member username. Type 'reset' to restore default.")
        .addStringOption(opt =>
          opt
            .setName("text")
            .setDescription("Custom welcome message. Use <username> for the member username. Type 'reset' for default.")
            .setMaxLength(1000)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("autorole")
        .setDescription("Set auto-role for new members")
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to assign")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("random")
        .setDescription("Enable or disable random welcome messages for new members.")
        .addBooleanOption(opt =>
          opt
            .setName("enabled")
            .setDescription("Enable random welcome messages?")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome Settings")
      .setColor("White")
      .setTimestamp();

    if (sub === "enable") {
      await updateGuildSettings(guildId, { "welcome.enabled": true });
      embed.setDescription("👋 Welcome system **enabled**.");
    } else if (sub === "disable") {
      await updateGuildSettings(guildId, { "welcome.enabled": false });
      embed.setDescription("👋 Welcome system **disabled**.");
    } else if (sub === "channel") {
      const channel = interaction.options.getChannel("channel");
      await updateGuildSettings(guildId, {
        "welcome.channelId": channel.id,
        "welcome.enabled": true,
      });
      embed.setDescription(`👋 Welcome channel set to ${channel}.`);
    } else if (sub === "autorole") {
      const role = interaction.options.getRole("role");
      await updateGuildSettings(guildId, {
        "welcome.autoRoleId": role.id,
        "welcome.enabled": true,
      });
      embed.setDescription(`🎭 Auto-role set to ${role}.`);
    } else if (sub === "message") {
      const text = interaction.options.getString("text");
      if (text.trim().toLowerCase() === "reset") {
        await updateGuildSettings(guildId, { "welcome.message": null });
        embed.setDescription("🔄 Welcome message reset to default.");
      } else {
        await updateGuildSettings(guildId, {
          "welcome.message": text,
          "welcome.enabled": true,
        });
        embed.setDescription(`✏️ Custom welcome message set to:\n\n${text}`);
      }
    } else if (sub === "random") {
      const enabled = interaction.options.getBoolean("enabled");
      await updateGuildSettings(guildId, { "welcome.randomMessagesEnabled": enabled });
      embed.setTitle("🎲 Random Welcome Messages")
        .setDescription(enabled
          ? "Random welcome messages are now enabled. Each new member will receive a random greeting from a set of 20 messages."
          : "Random welcome messages are now disabled. The custom or default message will be used.");
    }

    return respond(interaction, { embeds: [embed] });

    if (sub === "autorole") {
      const role = interaction.options.getRole("role");
      await updateGuildSettings(guildId, {
        "welcome.autoRoleId": role.id,
        "welcome.enabled": true,
      });
      embed.setDescription(`🎭 Auto-role set to ${role}.`);
    }

    if (sub === "message") {
      const text = interaction.options.getString("text");
      if (text.trim().toLowerCase() === "reset") {
        await updateGuildSettings(guildId, { "welcome.message": null });
        embed.setDescription("🔄 Welcome message reset to default.");
      } else {
        await updateGuildSettings(guildId, {
          "welcome.message": text,
          "welcome.enabled": true,
        });
        embed.setDescription(`✏️ Custom welcome message set to:\n\n${text}`);
      }
    }

    return respond(interaction, { embeds: [embed] });
  },
};
