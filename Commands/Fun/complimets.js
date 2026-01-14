const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Receive a random compliment."),

  async execute(interaction) {
    try {
      const compliments = [
        "✨ You’re that *nothing* when people ask me what I’m thinking about.",
        "🌟 You look amazing today.",
        "🧠 You’re a smart cookie.",
        "😊 I bet you make babies smile.",
        "🎩 You have impeccable manners.",
        "👕 I really like your style.",
        "😂 You have the best laugh.",
        "💙 I appreciate you.",
        "🌈 You are the most perfect *you* there is.",
        "💪 You’re stronger than you think.",
        "🪟 Your perspective is refreshing.",
        "🤝 You’re an awesome friend.",
        "💡 You light up the room.",
        "🤗 You deserve a hug right now.",
        "🏆 You should be proud of yourself.",
        "🛠 You’re more helpful than you realize.",
        "😄 You have a great sense of humor.",
        "🕺 You’ve got all the right moves!",
        "🌿 Your kindness is a balm to everyone around you.",
        "🔟 On a scale from 1 to 10, you’re an 11.",
        "🦁 You are brave.",
        "🌟 You bring out the best in other people.",
        "👂 You’re a great listener.",
        "🌍 Everything would be better if more people were like you.",
        "✨ You are making a difference.",
        "☀️ You’re like sunshine on a rainy day.",
        "💖 You’re wonderful just the way you are.",
      ];

      const compliment =
        compliments[Math.floor(Math.random() * compliments.length)];

      const embed = new EmbedBuilder()
        .setTitle("💖 A Compliment Just for You")
        .setColor("White")
        .setDescription(
          [
            "Here’s something nice — because you deserve it 💫",
            "",
            `> ${compliment}`,
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
      console.error("Compliment command failed:", error);

      return respond(interaction, {
        content: "❌ I couldn’t find a compliment right now — but you’re still awesome.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
