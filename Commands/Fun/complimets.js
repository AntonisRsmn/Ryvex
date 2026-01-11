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
        "You’re that “Nothing” when people ask me what I’m thinking about.",
        "You look great today.",
        "You’re a smart cookie.",
        "I bet you make babies smile.",
        "You have impeccable manners.",
        "I like your style.",
        "You have the best laugh.",
        "I appreciate you.",
        "You are the most perfect you there is.",
        "You’re strong.",
        "Your perspective is refreshing.",
        "You’re an awesome friend.",
        "You light up the room.",
        "You deserve a hug right now.",
        "You should be proud of yourself.",
        "You’re more helpful than you realize.",
        "You have a great sense of humor.",
        "You’ve got all the right moves!",
        "Your kindness is a balm to all who encounter it.",
        "On a scale from 1 to 10, you’re an 11.",
        "You are brave.",
        "You bring out the best in other people.",
        "You’re a great listener.",
        "Everything would be better if more people were like you!",
        "You are making a difference.",
        "You’re like sunshine on a rainy day.",
        "You’re wonderful.",
      ];

      const compliment =
        compliments[Math.floor(Math.random() * compliments.length)];

      const embed = new EmbedBuilder()
        .setTitle("💖 Compliment")
        .setDescription(compliment)
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
      console.error("Compliment command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to generate a compliment.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
