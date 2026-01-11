const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock, paper, scissors against the bot.")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("Choose rock, paper, or scissors.")
        .addChoices(
          { name: "🗻 Rock", value: "rock" },
          { name: "🧻 Paper", value: "paper" },
          { name: "✂ Scissors", value: "scissors" }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const userChoice = interaction.options.getString("choice");

      const choices = {
        rock: "🗻 Rock",
        paper: "🧻 Paper",
        scissors: "✂ Scissors",
      };

      const keys = Object.keys(choices);
      const botChoiceKey = keys[Math.floor(Math.random() * keys.length)];
      const botChoice = choices[botChoiceKey];

      let result;

      if (userChoice === botChoiceKey) {
        result = "🤝 It's a tie!";
      } else if (
        (userChoice === "rock" && botChoiceKey === "scissors") ||
        (userChoice === "paper" && botChoiceKey === "rock") ||
        (userChoice === "scissors" && botChoiceKey === "paper")
      ) {
        result = "🎉 You won!";
      } else {
        result = "😢 You lost!";
      }

      const embed = new EmbedBuilder()
        .setTitle("✊ Rock • Paper • Scissors")
        .setDescription(result)
        .addFields(
          { name: "Your choice", value: choices[userChoice], inline: true },
          { name: "My choice", value: botChoice, inline: true }
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
      console.error("RPS command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to play Rock Paper Scissors.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
