const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

// node-fetch (dynamic import safe)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random meme from Reddit 😂"),

  async execute(interaction) {
    try {
      // Use multiple subreddits for better reliability
      const subreddits = [
        "memes",
        "dankmemes",
        "shitposting",
        "wholesomememes",
      ];

      const subreddit =
        subreddits[Math.floor(Math.random() * subreddits.length)];

      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/random/.json`,
        { headers: { "User-Agent": "RyvexBot/1.0" } }
      );

      const data = await res.json();

      const post =
        data?.[0]?.data?.children?.[0]?.data;

      // Validate meme
      if (
        !post ||
        post.over_18 ||
        !post.url ||
        post.is_video ||
        post.url.endsWith(".gifv")
      ) {
        return respond(interaction, {
          content: "😕 Couldn't find a good meme. Try again!",
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("😂 Meme Time")
        .setDescription(`**${post.title}**`)
        .setImage(post.url)
        .setColor("White")
        .setFooter({
          text: `From r/${subreddit} • 👍 ${post.ups ?? 0}`,
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Meme command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch a meme. Reddit might be down.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
