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
        .setDescription("Check out our [Website](https://zepp.glitch.me)")

        interaction.reply({ embeds: [embed]})
    }
}
