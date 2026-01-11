const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const ms = require("ms");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");
const {
  suppressMemberUpdate,
} = require("../../Utils/memberUpdateSuppressor");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Member to mute.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("time")
        .setDescription("Duration (e.g. 10m, 1h, 2d — max 27 days).")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the mute.")
    ),

  async execute(interaction) {
    try {
      const { guild, member: moderator, options } = interaction;

      const targetUser = options.getUser("target");
      const timeInput = options.getString("time");
      const duration = ms(timeInput);
      const reason = options.getString("reason") || "No reason provided";

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ I don't have permission to timeout members.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── INVALID DURATION ───────── */
      if (!duration || duration <= 0 || duration > 2_332_800_000) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Invalid duration. Max is 27 days.")
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

      /* ───────── PROTECTIONS ───────── */
      if (targetMember.id === guild.ownerId) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot mute the server owner.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (targetMember.id === moderator.id) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You cannot mute yourself.")
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
                "❌ You cannot mute a member with an equal or higher role."
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
                "❌ I cannot mute this member due to role hierarchy."
              )
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── SUPPRESS EVENT LOG ───────── */
      suppressMemberUpdate(guild.id, targetUser.id);

      /* ───────── EXECUTE MUTE ───────── */
      await targetMember.timeout(duration, reason);

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        action: "Mute",
        target: targetUser,
        moderator: interaction.user,
        reason,
        duration: timeInput,
      });

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔇 Member Muted")
            .setDescription(`Successfully muted ${targetUser}.`)
            .addFields(
              { name: "Duration", value: timeInput, inline: true },
              { name: "Reason", value: reason, inline: true }
            )
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Mute failed:", error);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to mute the member.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
