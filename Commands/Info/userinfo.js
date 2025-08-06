const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get info about a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to get info.")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const { options } = interaction;
      const user = options.getUser("user") || interaction.user;
      const member = await interaction.guild.members.cache.get(user.id);

      if (!member) {
        return interaction.reply({
          content: "User not found in this server.",
          flags: 64,
        });
      }

      const icon = member.displayAvatarURL();
      const tag = user.tag;

      const embed = new EmbedBuilder()
        .setColor(0xfffffe)
        .setAuthor({ name: tag, iconURL: icon })
        .addFields(
          { name: "Name: ", value: `${user}`, inline: false },
          {
            name: "Roles: ",
            value: `${member.roles.cache.map((r) => r).join(` `)}`,
            inline: false,
          },
          { name: "Nickname: ", value: `${member.nickname}`, inline: true },
          { name: "ID: ", value: `${user.id}`, inline: true },
          {
            name: "Joined Server: ",
            value: `<t:${parseInt(member.joinedAt / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Joined Discord: ",
            value: `<t:${parseInt(member.user.createdAt / 1000)}:R>`,
            inline: true,
          }
        )
        .setFooter({
          text: `By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({
        content: `Error: ${err.message || err}`,
        flags: 64,
      });
    }
  },
};
