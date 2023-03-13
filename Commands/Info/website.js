const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Roumy™ Support."),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setTitle(`***Roumy™ Support***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Check out our [Website](https://roumy.glitch.me)")

        interaction.reply({ embeds: [embed]})
    }
}