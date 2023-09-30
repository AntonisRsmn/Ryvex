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

        interaction.reply({ embeds: [embed]})
    }
}
