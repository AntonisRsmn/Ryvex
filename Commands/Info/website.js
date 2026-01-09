const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Get the Ryvex website."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🌐 Ryvex Website")
        .setDescription("Visit the official Ryvex website:\n👉 https://ryvex.gr/")
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Website command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to display the website link.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
