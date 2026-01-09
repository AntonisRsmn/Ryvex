const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get information about a member.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to get info about.")
    ),

  async execute(interaction) {
    try {
      const user =
        interaction.options.getUser("user") || interaction.user;

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "❌ User not found in this server.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const roles =
        member.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .map(role => role.toString())
          .join(" ") || "None";

      const embed = new EmbedBuilder()
        .setAuthor({
          name: user.tag,
          iconURL: user.displayAvatarURL(),
        })
        .setColor("White")
        .addFields(
          { name: "User", value: `${user}`, inline: true },
          { name: "ID", value: user.id, inline: true },
          { name: "Nickname", value: member.nickname ?? "None", inline: true },
          {
            name: "Joined Server",
            value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Account Created",
            value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          { name: "Roles", value: roles, inline: false }
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Userinfo command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to fetch user information.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
