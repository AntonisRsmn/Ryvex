const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ppmeter")
    .setDescription("PP meter."),

  async execute(interaction) {
    try {
      const sizes = [
        "8=D",
        "8==D",
        "8===D",
        "8====D",
        "8=====D",
        "8======D",
        "8=======D",
        "8========D",
        "8=========D",
        "8==========D",
      ];

      const result = sizes[Math.floor(Math.random() * sizes.length)];

      const embed = new EmbedBuilder()
        .setTitle("📏 PP Meter")
        .setDescription(`Your PP size is:\n\n${result}`)
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
      console.error("PPmeter command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to measure PP size.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
