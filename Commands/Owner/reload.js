const { Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const { loadEvents } = require("../../Handlers/eventHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload your commands or events.")
    .addSubcommand(subcommand =>
      subcommand.setName("commands")
        .setDescription("Reload your commands.")
    )
    .addSubcommand(subcommand =>
      subcommand.setName("events")
        .setDescription("Reload your events.")
    ),

  async execute(interaction, client) {

    const { user } = interaction;

    if (user.id !== "493343656028143647") return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor("fffffe")
        .setDescription("This command is only for the bot developer.")], ephemeral: true
    })

    const sub = interaction.options.getSubcommand()
    const embed = new EmbedBuilder()
      .setTitle("Developer")
      .setColor("fffffe")

    switch (sub) {
      case "commands": {
        loadCommands(client)
        interaction.reply({ embeds: [embed.setDescription("☑️ Commands Reloaded")] })
        console.log(`${user} Has reloaded the commands.`)
      }
        break;
      case "events": {
        loadEvents(client)
        interaction.reply({ embeds: [embed.setDescription("☑️ Events Reloaded")] })
        console.log(`${user} Has reloaded the events.`)
      }
        break;
    }
  }
}