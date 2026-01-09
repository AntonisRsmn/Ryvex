const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gaymeter")
    .setDescription("Gay meter."),

  async execute(interaction) {
    try {
      const percentage = Math.floor(Math.random() * 101);

      const embed = new EmbedBuilder()
        .setTitle("🌈 Gay Meter")
        .setDescription(`You are **${percentage}%** gay`)
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
      console.error("Gaymeter command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to calculate gay meter.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
