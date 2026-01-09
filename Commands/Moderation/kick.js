const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Member to be kicked.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the kick.")
    ),

  async execute(interaction) {
    const { guild, member: moderator, options } = interaction;

    const targetUser = options.getUser("target");
    const reason = options.getString("reason") || "No reason provided";

    // Bot permission check
    if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to kick members.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Self-kick protection
    if (targetUser.id === moderator.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You cannot kick yourself.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Owner protection
    if (targetUser.id === guild.ownerId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You cannot kick the server owner.")
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

    // Moderator role hierarchy check
    if (targetMember.roles.highest.position >= moderator.roles.highest.position) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ You cannot kick a member with an equal or higher role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Bot role hierarchy check
    if (
      targetMember.roles.highest.position >=
      guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ I cannot kick this member due to role hierarchy."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Execute kick
    try {
      await targetMember.kick(reason);

      // ✅ LOG ONLY AFTER SUCCESS
      await logAction({
        guild,
        action: "Kick",
        target: targetUser,
        moderator: interaction.user,
        reason,
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ **${targetUser.tag}** was kicked.\n**Reason:** ${reason}`
            )
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Kick failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ Failed to kick this member. Check permissions and role position."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
