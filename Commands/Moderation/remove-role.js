const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-role")
    .setDescription("Remove a role from a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Member to remove the role from.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Role to remove.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, member: moderator, options } = interaction;

    const targetUser = options.getUser("target");
    const role = options.getRole("role");

    // Bot permission check
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to manage roles.")
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
            .setDescription("❌ You cannot modify the server owner's roles.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Self-action protection
    if (targetMember.id === moderator.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You cannot modify your own roles.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Moderator role hierarchy check
    if (role.position >= moderator.roles.highest.position) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ You cannot remove a role higher or equal to your highest role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Bot role hierarchy check
    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ I cannot remove a role higher or equal to my highest role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Role presence check
    if (!targetMember.roles.cache.has(role.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `❌ ${targetUser.tag} does not have the ${role.name} role.`
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Execute role removal
    try {
      await targetMember.roles.remove(role);

      // ✅ LOG AFTER SUCCESS
      await logAction({
        guild,
        action: "Remove Role",
        target: targetUser,
        moderator: interaction.user,
        reason: `Role removed: ${role.name}`,
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ Successfully removed ${role} from ${targetUser}.`
            )
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Remove-role failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ Failed to remove the role. Check permissions and role hierarchy."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
