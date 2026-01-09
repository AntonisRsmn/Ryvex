const {
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client;

    // Guild-only command protection
    if (!interaction.guild) {
      const embed = new EmbedBuilder()
        .setTitle("Ryvex™")
        .setDescription("❌ Commands can only be used inside servers.")
        .setColor("White")
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return interaction.reply({
        content: "❌ This command is outdated or unavailable.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ An error occurred while executing this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
