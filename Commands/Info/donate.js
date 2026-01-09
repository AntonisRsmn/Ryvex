const { SlashCommandBuilder, EmbedBuilder, MessageFlags, } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Support Ryvex by donating."),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("💖 Donate")
        .setDescription(
          "Consider [donating](https://www.paypal.com/paypalme/AnthoxWasTaken) to help improve **Ryvex** for everyone. Thank you for the support!"
        )
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
      console.error("Donate command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to display the donation link.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
