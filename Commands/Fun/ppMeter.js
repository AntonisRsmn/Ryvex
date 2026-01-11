const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

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

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("PPmeter command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to measure PP size.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
