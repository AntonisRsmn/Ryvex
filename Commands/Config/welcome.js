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
        .setName("autorole")
        .setDescription("Set auto-role for new members")
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to assign")
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
    }

    if (sub === "disable") {
      await updateGuildSettings(guildId, { "welcome.enabled": false });
      embed.setDescription("👋 Welcome system **disabled**.");
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
  },
};
