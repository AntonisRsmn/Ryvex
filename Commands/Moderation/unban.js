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
    .setName("unban")
    .setDescription("Unban a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName("userid")
        .setDescription("Discord ID of the user to unban.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, options, user: moderator } = interaction;
      const userId = options.getString("userid");

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ I don't have permission to unban members.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      let bannedUser;
      try {
        bannedUser = await guild.bans.fetch(userId);
      } catch {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ This user is not banned or the ID is invalid.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── EXECUTE UNBAN ───────── */
      await guild.members.unban(userId);

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        type: "moderation",
        action: "Unban",
        target: bannedUser.user,
        moderator,
        reason: "Unbanned via command",
      });

      /* ───────── SUCCESS UX (IMPROVED) ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔓 Member Unbanned")
            .setColor("White")
            .addFields(
              {
                name: "👤 User",
                value: `${bannedUser.user.tag}`,
                inline: true,
              },
              {
                name: "👮 Moderator",
                value: `${moderator}`,
                inline: true,
              },
              {
                name: "📝 Reason",
                value: "Unbanned via command",
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
      console.error("Unban failed:", error);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to unban the user.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
