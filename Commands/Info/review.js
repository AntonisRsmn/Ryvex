const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("review")
    .setDescription("Leave a review for Ryvex on Top.gg!"),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("⭐ Review Ryvex")
        .setColor("White")
        .setDescription(
          [
            "If you're enjoying **Ryvex**, please consider leaving a review on **Top.gg**!",
            "",
            "Your feedback helps other servers discover Ryvex",
            "and motivates continued development. 💙",
          ].join("\n")
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("⭐ Leave a Review")
          .setStyle(ButtonStyle.Link)
          .setURL("https://top.gg/bot/1014993899871285289#reviews")
      );

      return respond(interaction, {
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Review command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to display review information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
