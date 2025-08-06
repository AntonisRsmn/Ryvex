const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Ryvex Website."),

    async execute(interaction, client) {
    try {

        const embed = new EmbedBuilder()
        .setTitle(`***Ryvex Website***`)
        .setColor("#fffffe")
        .setTimestamp()
        .setDescription("Check out our [Website](https://ryvex.gr/)")
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
