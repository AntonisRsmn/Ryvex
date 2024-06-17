const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Zepp™ Support Server."),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setTitle(`***Zepp™ Support***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Need some help join [Here](https://discord.gg/JDDSbxKDne)")
        .setFooter({
            text: `By ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })

        interaction.reply({ embeds: [embed]})
    }
}
