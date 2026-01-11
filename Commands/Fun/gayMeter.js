const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

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

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Gaymeter command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to calculate gay meter.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
