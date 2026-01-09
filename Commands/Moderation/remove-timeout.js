const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-timeout")
    .setDescription("Remove the timeout from a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Member to remove the timeout from.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, member: moderator, options } = interaction;

    const targetUser = options.getUser("target");

    // Bot permission check
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to moderate members.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let targetMember;
    try {
      targetMember = await guild.members.fetch(targetUser.id);
    } catch {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Member not found in this server.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Owner protection
    if (targetMember.id === guild.ownerId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ You cannot remove the timeout from the server owner."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Self protection
    if (targetMember.id === moderator.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You cannot remove your own timeout.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Role hierarchy check
    if (
      targetMember.roles.highest.position >=
      moderator.roles.highest.position
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ You cannot modify a member with an equal or higher role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Not timed out check
    if (!targetMember.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ This member is not currently timed out.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await targetMember.timeout(null);

      // ✅ LOG AFTER SUCCESS
      await logAction({
        guild,
        action: "Remove Timeout",
        target: targetUser,
        moderator: interaction.user,
        reason: "Timeout removed",
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Timeout removed from ${targetUser}.`)
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Remove-timeout failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to remove the timeout.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
