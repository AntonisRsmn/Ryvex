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
        .setDescription("What do you want to ask?")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const question = interaction.options.getString("question");

      const responses = [
        "🟢 It is certain.",
        "🟢 Without a doubt.",
        "🟢 Yes — definitely.",
        "🟢 You may rely on it.",
        "🟢 Outlook looks good.",
        "🟡 Ask again later.",
        "🟡 Cannot predict now.",
        "🟡 Reply hazy, try again.",
        "🟡 Better not tell you now.",
        "🔴 Don’t count on it.",
        "🔴 My reply is no.",
        "🔴 My sources say no.",
        "🔴 Outlook not so good.",
        "🔴 Very doubtful.",
      ];

      const answer =
        responses[Math.floor(Math.random() * responses.length)];

      const embed = new EmbedBuilder()
        .setTitle("🎱 Magic 8-Ball")
        .setColor("White")
        .setDescription(
          [
            "✨ *The magic 8-ball has spoken…*",
            "",
            `❓ **Your Question**`,
            `> ${question}`,
            "",
            `🔮 **Answer**`,
            `> ${answer}`,
          ].join("\n")
        )
        .setFooter({
          text: `Asked by ${interaction.user.username}`,
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
        content: "❌ The magic 8-ball is silent right now. Try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
