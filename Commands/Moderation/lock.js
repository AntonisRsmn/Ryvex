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
    .setName("lock")
    .setDescription("Lock a text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to lock.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for locking the channel.")
    ),

  async execute(interaction) {
    const { guild, options, user: moderator } = interaction;
    const channel = options.getChannel("channel");
    const reason = options.getString("reason") || "No reason provided";

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

    // Already locked check
    if (
      !channel
        .permissionsFor(guild.roles.everyone)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`❌ ${channel} is already locked.`)
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: false },
        { reason }
      );

      // ✅ LOG AFTER SUCCESS
      await logAction({
        guild,
        action: "Channel Lock",
        target: channel,
        moderator,
        reason,
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `🔒 ${channel} has been locked.\n**Reason:** ${reason}`
            )
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
      console.error("Lock failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to lock the channel.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
