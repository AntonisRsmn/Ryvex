const {CommandInteraction, InteractionResponse, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    execute(interaction, client) {
        const embed = new EmbedBuilder()
        .setTitle("Ryvex™")
        .setDescription("Commands can only be used inside servers.")
        .setColor("fffffe")
        .setTimestamp()

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            interaction.reply({content: "outdated command"});
        }

        if (!interaction.guild)
            return interaction.reply({ embeds: [embed], ephemeral: true })

        command.execute(interaction, client);
    },
};