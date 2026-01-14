const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Visit the official Ryvex™ website."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🌐 Ryvex™ Official Website")
        .setColor("White")
        .setDescription(
          [
            "Welcome to the **Ryvex™ Website** 👋",
            "",
            "On our website you can find:",
            "• 📘 Information about Ryvex features",
            "• ⚙️ Guides & setup instructions",
            "• 🧠 Future updates and improvements",
            "• 💡 Project details & vision",
            "",
            "👉 **Visit here:**",
            "🔗 https://ryvex.gr/",
            "",
            "Thank you for supporting Ryvex ❤️",
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
      console.error("Website command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display the website link.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
