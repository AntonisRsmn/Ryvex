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
    .setName("untimeout")
    .setDescription("Remove the timeout from a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Member to remove the timeout from.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, member: moderator, options } = interaction;
      const targetUser = options.getUser("target");

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return respond(interaction, {
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
      if (targetMember.id === guild.ownerId) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot untimeout the server owner.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (targetMember.id === moderator.id) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot untimeout yourself.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        targetMember.roles.highest.position >=
        moderator.roles.highest.position
      ) {
        return respond(interaction, {
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

      if (!targetMember.isCommunicationDisabled()) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ This member is not currently timed out.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── SUPPRESS MEMBER UPDATE EVENT ───────── */
      suppressMemberUpdate(guild.id, targetUser.id);

      /* ───────── EXECUTE UNTIMEOUT ───────── */
      await targetMember.timeout(null);

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        action: "Untimeout",
        target: targetUser,
        moderator: interaction.user,
        reason: "Timeout removed",
      });

      /* ───────── SUCCESS UX (IMPROVED) ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔊 Timeout Removed")
            .setColor("White")
            .addFields(
              {
                name: "👤 Member",
                value: `${targetUser}`,
                inline: true,
              },
              {
                name: "👮 Moderator",
                value: `${interaction.user}`,
                inline: true,
              },
              {
                name: "📝 Reason",
                value: "Timeout removed",
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
      console.error("Untimeout failed:", error);

      return respond(interaction, {
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
