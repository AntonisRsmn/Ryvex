const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gaymeter")
    .setDescription("Measure the gay energy level 😌🌈"),

  async execute(interaction) {
    try {
      const percentage = Math.floor(Math.random() * 101);

      // Fun status text based on percentage
      let status = "😎 Just vibing";
      if (percentage >= 90) status = "🔥 Maximum Pride Energy";
      else if (percentage >= 70) status = "🌈 Loud & Proud";
      else if (percentage >= 40) status = "✨ Stylishly Gay";
      else if (percentage >= 15) status = "👀 A Little Sus";

      const embed = new EmbedBuilder()
        .setTitle("🌈 Gay Meter Results")
        .setColor("White")
        .setDescription(
          [
            "Scanning your vibe…",
            "",
            `💖 **Result:** **${percentage}%**`,
            `📊 **Status:** ${status}`,
            "",
            "> *This meter is 100% for fun.*",
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
      console.error("Gaymeter command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to measure the vibes.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
