const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const IMAGE_REGEX = /\.(jpg|jpeg|png|webp|gif)$/i;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random meme 😂"),

  async execute(interaction) {
    try {
      const meme = await getRedditMeme() || await getFallbackMeme();

      if (!meme) {
        return respond(interaction, {
          content: "😕 Couldn't fetch a meme right now. Try again later.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("😂 Meme Time")
        .setDescription(meme.title)
        .setImage(meme.url)
        .setColor("White")
        .setFooter({ text: meme.footer })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error("Meme command failed:", err);

      return respond(interaction, {
        content: "❌ Meme service temporarily unavailable.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

/* ───────── REDDIT SOURCE ───────── */

async function getRedditMeme() {
  try {
    const subreddits = [
      "memes",
      "dankmemes",
      "shitposting",
      "wholesomememes",
    ];

    const subreddit =
      subreddits[Math.floor(Math.random() * subreddits.length)];

    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`,
      {
        headers: {
          "User-Agent": "RyvexBot/1.9.2 (by u/Ryvex)",
        },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();

    const posts = json?.data?.children
      ?.map(c => c.data)
      ?.filter(post =>
        post &&
        !post.over_18 &&
        !post.is_video &&
        post.url &&
        IMAGE_REGEX.test(post.url) &&
        !post.url.endsWith(".gifv")
      );

    if (!posts || posts.length === 0) return null;

    const meme = posts[Math.floor(Math.random() * posts.length)];

    return {
      title: meme.title,
      url: meme.url,
      footer: `From r/${subreddit} • 👍 ${meme.ups ?? 0}`,
    };
  } catch {
    return null;
  }
}

/* ───────── FALLBACK API ───────── */

async function getFallbackMeme() {
  try {
    const res = await fetch("https://meme-api.com/gimme");

    if (!res.ok) return null;

    const data = await res.json();

    if (
      !data ||
      data.nsfw ||
      data.spoiler ||
      !data.url ||
      !IMAGE_REGEX.test(data.url)
    ) {
      return null;
    }

    return {
      title: data.title ?? "Meme",
      url: data.url,
      footer: `From r/${data.subreddit} • 👍 ${data.ups ?? 0}`,
    };
  } catch {
    return null;
  }
}
