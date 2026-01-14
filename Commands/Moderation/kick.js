const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");
const {
  suppressMemberRemove,
} = require("../../Utils/memberRemoveSuppressor");

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
    try {
      const { guild, member: moderator, options } = interaction;

      const targetUser = options.getUser("target");
      const reason = options.getString("reason") || "No reason provided";

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ I don't have permission to kick members.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── SAFETY CHECKS ───────── */
      if (targetUser.id === moderator.id) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot kick yourself.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (targetUser.id === guild.ownerId) {
        return respond(interaction, {
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
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Member not found in this server.")
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
                "❌ You cannot kick a member with an equal or higher role."
              )
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        targetMember.roles.highest.position >=
        guild.members.me.roles.highest.position
      ) {
        return respond(interaction, {
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

      /* ───────── EXECUTE KICK ───────── */
      suppressMemberRemove(guild.id, targetUser.id);
      await targetMember.kick(reason);

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        type: "moderation",
        action: "Kick",
        target: targetUser,
        moderator: interaction.user,
        reason,
      });

      /* ───────── SUCCESS UX (IMPROVED) ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("👢 Member Kicked")
            .setColor("White")
            .addFields(
              {
                name: "👤 Member",
                value: `${targetUser.tag}`,
                inline: true,
              },
              {
                name: "👮 Moderator",
                value: `${interaction.user}`,
                inline: true,
              },
              {
                name: "📝 Reason",
                value: reason,
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
      console.error("Kick failed:", error);

      return respond(interaction, {
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
