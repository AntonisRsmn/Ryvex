const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Support Ryvex and help its development."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("💖 Support Ryvex")
        .setColor("White")
        .setDescription(
          [
            "Ryvex is actively developed with a focus on **stability**,",
            "**moderation quality**, and **long-term reliability**.",
            "",
            "If you enjoy using Ryvex and want to support its future:",
            "",
            "👉 **Donate via PayPal:**",
            "🔗 https://www.paypal.com/paypalme/AnthoxWasTaken",
            "",
            "✨ Every contribution helps with:",
            "• Feature development",
            "• Server & hosting costs",
            "• Maintenance and improvements",
            "",
            "_Thank you for supporting the project ❤️_",
          ].join("\n")
        )
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
      console.error("Donate command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display donation information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
