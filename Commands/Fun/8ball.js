const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a yes or no question.")
    .addStringOption(option =>
      option
        .setName("question")
        .setDescription("The question you want to ask.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const question = interaction.options.getString("question");

      const responses = [
        "As I see it, yes.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don’t count on it.",
        "It is certain.",
        "It is decidedly so.",
        "Most likely.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Outlook good.",
        "Reply hazy, try again.",
        "Signs point to yes.",
        "Very doubtful.",
        "Without a doubt.",
        "Yes.",
        "Yes – definitely.",
        "You may rely on it.",
      ];

      const answer =
        responses[Math.floor(Math.random() * responses.length)];

      const embed = new EmbedBuilder()
        .setTitle("🎱 Magic 8-Ball")
        .addFields(
          { name: "Question", value: question },
          { name: "Answer", value: answer }
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
      console.error("8ball command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to get an answer from the 8-ball.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
