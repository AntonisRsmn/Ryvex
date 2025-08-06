const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ppmeter")
    .setDescription("PP meter."),

  async execute(interaction) {
    var ppmeter = [
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
    const response = ppmeter[Math.floor(Math.random() * ppmeter.length)];

    const embed = new EmbedBuilder()
      .setTitle("PPmeter")
      .setDescription("Your pp size is: " + response)
      .setColor(0xfffffe)
      .setFooter({
        text: `By ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
