const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");
const {
  suppressMemberUpdate,
} = require("../../Utils/memberUpdateSuppressor");

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
    try {
      const { guild, member: moderator, options } = interaction;

      const targetUser = options.getUser("target");
      const role = options.getRole("role");

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return respond(interaction, {
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
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Member not found in this server.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── SAFETY CHECKS ───────── */
      if (
        targetMember.id === guild.ownerId ||
        targetMember.id === moderator.id
      ) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot modify this member’s roles.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        role.position >= moderator.roles.highest.position ||
        role.position >= guild.members.me.roles.highest.position
      ) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Role hierarchy prevents this action.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!targetMember.roles.cache.has(role.id)) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `❌ ${targetUser.tag} does not have the **${role.name}** role.`
              )
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── EXECUTE ACTION ───────── */

      // 🔕 Prevent duplicate guildMemberUpdate logs
      suppressMemberUpdate(guild.id, targetUser.id);

      await targetMember.roles.remove(role);

      // 🛡 MODERATION LOG
      await logAction({
        guild,
        action: "Role Removed",
        target: targetUser,
        moderator: interaction.user,
        reason: `Removed role: ${role.name}`,
      });

      /* ───────── SUCCESS UX (IMPROVED) ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("➖ Role Removed")
            .setColor("White")
            .addFields(
              {
                name: "👤 Member",
                value: `${targetUser}`,
                inline: true,
              },
              {
                name: "🎭 Role",
                value: `${role}`,
                inline: true,
              },
              {
                name: "👮 Moderator",
                value: `${interaction.user}`,
                inline: false,
              }
            )
            .setFooter({
              text: "Ryvex • Moderation Action",
            })
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Remove-role failed:", error);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to remove the role.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
