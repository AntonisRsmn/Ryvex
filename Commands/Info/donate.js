const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Support Zepp by donating"),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setTitle(`***Donate***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Consider [Donating](https://www.paypal.me/AntoniosRusman) to help me make Zepp better for everyone Thanks.")

        interaction.reply({ embeds: [embed]})
    }
}