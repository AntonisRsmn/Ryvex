const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client;

    // Guild-only command protection (this is allowed here)
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
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      // IMPORTANT: log only — NEVER reply here
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );
    }
  },
};
