  const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags,
  } = require("discord.js");

  const { respond } = require("../../Utils/respond");
  const { logAction } = require("../../Utils/logAction");

  module.exports = {
    data: new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Ban a member from the guild.")
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
      .addUserOption(option =>
        option
          .setName("target")
          .setDescription("Member to be banned.")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("reason")
          .setDescription("Reason for the ban.")
      ),

    async execute(interaction) {
      try {
        const { guild, member: moderator, options } = interaction;

        const targetUser = options.getUser("target");
        const reason = options.getString("reason") || "No reason provided";

        /* ───────── BOT PERMISSION CHECK ───────── */
        if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
          return respond(interaction, {
            embeds: [
              new EmbedBuilder()
                .setDescription("❌ I don't have permission to ban members.")
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
                .setDescription("❌ You cannot ban yourself.")
                .setColor("Red"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        if (targetUser.id === guild.ownerId) {
          return respond(interaction, {
            embeds: [
              new EmbedBuilder()
                .setDescription("❌ You cannot ban the server owner.")
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
                  "❌ You cannot ban a member with an equal or higher role."
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
                  "❌ I cannot ban this member due to role hierarchy."
                )
                .setColor("Red"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        /* ───────── EXECUTE BAN ───────── */
        await targetMember.ban({ reason });

        // ✅ MODERATION LOG
        await logAction({
          guild,
          type: "moderation",
          action: "Ban",
          target: targetUser,
          moderator: interaction.user,
          reason,
        });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `✅ **${targetUser.tag}** was banned.\n**Reason:** ${reason}`
              )
              .setColor("White")
              .setTimestamp(),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.error("Ban failed:", error);

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "❌ Failed to ban this member. Check permissions and role position."
              )
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    },
  };
