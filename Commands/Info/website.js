const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Zepp Website."),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setTitle(`***Zepp Website***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Check out our [Website](https://zepp.gr)")
        .setFooter({
            text: `By ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })

        interaction.reply({ embeds: [embed]})
    }
}
