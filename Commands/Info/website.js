const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Get the Ryvex website."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🌐 Ryvex Website")
        .setDescription(
          "Visit the official Ryvex website:\n👉 https://ryvex.gr/"
        )
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
      console.error("Website command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display the website link.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
