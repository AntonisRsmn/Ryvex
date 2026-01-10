const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-role")
    .setDescription("Add a role to a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("User to add the role to.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Role to add.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, member: moderator, options } = interaction;

    const targetUser = options.getUser("target");
    const role = options.getRole("role");

    /* ───────── BOT PERMISSION CHECK ───────── */
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

    /* ───────── SAFETY CHECKS ───────── */
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

    if (role.position >= moderator.roles.highest.position) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ You cannot assign a role higher or equal to your highest role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ I cannot assign a role higher or equal to my highest role."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (targetMember.roles.cache.has(role.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `❌ ${targetUser.tag} already has the **${role.name}** role.`
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    /* ───────── EXECUTE ACTION ───────── */
    try {
      await targetMember.roles.add(role);

      // ✅ MODERATION LOG (explicit)
      await logAction({
        guild,
        type: "moderation",
        action: "Role Added",
        target: targetUser,
        moderator: interaction.user,
        reason: `Added role: ${role.name}`,
        extra: {
          Role: role.name,
        },
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Successfully added ${role} to ${targetUser}.`)
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Add-role failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ Failed to add the role. Check permissions and role hierarchy."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
