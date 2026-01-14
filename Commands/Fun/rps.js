const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock, Paper, Scissors against Ryvex 🤖")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("Choose your move")
        .setRequired(true)
        .addChoices(
          { name: "🗻 Rock", value: "rock" },
          { name: "🧻 Paper", value: "paper" },
          { name: "✂ Scissors", value: "scissors" }
        )
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

      let outcome;
      let color;

      if (userChoice === botChoiceKey) {
        outcome = "🤝 **It's a tie!**";
        color = "Grey";
      } else if (
        (userChoice === "rock" && botChoiceKey === "scissors") ||
        (userChoice === "paper" && botChoiceKey === "rock") ||
        (userChoice === "scissors" && botChoiceKey === "paper")
      ) {
        outcome = "🎉 **You win!**";
        color = "Green";
      } else {
        outcome = "😢 **You lose!**";
        color = "Red";
      }

      const embed = new EmbedBuilder()
        .setTitle("✊ Rock • Paper • Scissors")
        .setColor(color)
        .setDescription(
          [
            outcome,
            "",
            "### 🧠 Choices",
            `👤 **You:** ${choices[userChoice]}`,
            `🤖 **Ryvex:** ${choices[botChoiceKey]}`,
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
      console.error("RPS command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to play Rock Paper Scissors.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
