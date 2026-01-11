const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get the Ryvex™ support server."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🆘 Ryvex™ Support")
        .setDescription(
          "Need help? Join the **Ryvex™ Support Server**:\n👉 https://discord.gg/JDDSbxKDne"
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
      console.error("Support command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display the support server link.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
