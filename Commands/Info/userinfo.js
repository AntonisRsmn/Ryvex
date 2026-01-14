const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View detailed information about a server member.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Select a user (defaults to yourself).")
    ),

  async execute(interaction) {
    try {
      const user =
        interaction.options.getUser("user") || interaction.user;

      const member = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      if (!member) {
        return respond(interaction, {
          content: "❌ This user is not a member of the server.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const roles =
        member.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .map(role => role.toString())
          .join(", ") || "None";

      const embed = new EmbedBuilder()
        .setTitle("👤 User Information")
        .setColor("White")
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          {
            name: "📛 User",
            value: `${user.tag}`,
            inline: true,
          },
          {
            name: "🆔 User ID",
            value: user.id,
            inline: true,
          },
          {
            name: "🏷 Nickname",
            value: member.nickname ?? "None",
            inline: true,
          },
          {
            name: "📅 Account Created",
            value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: "📥 Joined Server",
            value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: "🎭 Roles",
            value: roles,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Userinfo command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch user information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
