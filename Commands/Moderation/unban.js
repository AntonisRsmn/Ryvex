const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

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
    const { guild, options, user: moderator } = interaction;
    const userId = options.getString("userid");

    // Bot permission check
    if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
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
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ This user is not banned or the ID is invalid.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await guild.members.unban(userId);

      // ✅ LOG AFTER SUCCESS
      await logAction({
        guild,
        action: "Unban",
        target: bannedUser.user,
        moderator,
        reason: "Unbanned via command",
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `✅ Successfully unbanned **${bannedUser.user.tag}**.`
            )
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Unban failed:", error);

      return interaction.reply({
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
