const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Roumy's Website."),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setTitle(`***Roumy Website***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Check out our [Website](https://roumy.glitch.me)")

        interaction.reply({ embeds: [embed]})
    }
}
