const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get help and join the Ryvex™ support server."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🆘 Ryvex™ Support Center")
        .setColor("White")
        .setDescription(
          [
            "Welcome to **Ryvex™ Support** 👋",
            "",
            "Need help with:",
            "• ⚙️ Bot setup or configuration",
            "• 🛡 Moderation commands",
            "• 🐛 Bug reports or issues",
            "• 💡 Suggestions & feedback",
            "",
            "👉 **Join the official support server:**",
            "🔗 https://discord.gg/JDDSbxKDne",
            "",
            "Our team will be happy to assist you!",
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
      console.error("Support command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display the support server link.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
