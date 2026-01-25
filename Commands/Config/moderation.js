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
    .setName("moderation")
    .setDescription("Configure moderation logging.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub
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
    .addSubcommand(sub =>
      sub
        .setName("disable")
        .setDescription("Disable separate moderation logs")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const embed = new EmbedBuilder()
      .setTitle("🛡 Moderation Log Settings")
      .setColor("White")
      .setTimestamp();

    if (sub === "channel") {
      const channel = interaction.options.getChannel("channel");
      await updateGuildSettings(guildId, {
        "moderation.enabled": true,
        "moderation.channelId": channel.id,
      });
      embed.setDescription(`🛡 Moderation logs set to ${channel}.`);
    }

    if (sub === "disable") {
      await updateGuildSettings(guildId, {
        "moderation.enabled": false,
        "moderation.channelId": null,
      });
      embed.setDescription("🛡 Separate moderation logs **disabled**.");
    }

    return respond(interaction, { embeds: [embed] });
  },
};
