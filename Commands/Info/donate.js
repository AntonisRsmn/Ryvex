const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Support Ryvex by donating"),

    async execute(interaction, client) {
        try {

        const embed = new EmbedBuilder()
        .setTitle(`***Donate***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Consider [Donating](https://www.paypal.com/paypalme/AnthoxWasTaken) to help me make Ryvex better for everyone Thanks.")
        .setFooter({
            text: `By ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })

        interaction.reply({ embeds: [embed]})

        } catch (err) {
        await interaction.reply({ content: "There was an error.", flags: 64 });
        }
    }
}