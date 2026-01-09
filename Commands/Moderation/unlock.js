const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to unlock.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, options, user: moderator } = interaction;
    const channel = options.getChannel("channel");

    // Bot permission check
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to manage channels.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Already unlocked check
    if (
      channel
        .permissionsFor(guild.roles.everyone)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`❌ ${channel} is already unlocked.`)
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: null }
      );

      // ✅ LOG AFTER SUCCESS
      await logAction({
        guild,
        action: "Channel Unlock",
        target: channel,
        moderator,
        reason: "Channel unlocked",
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`🔓 ${channel} has been unlocked.`)
            .setColor("White")
            .setFooter({
              text: `By ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Unlock failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to unlock the channel.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
