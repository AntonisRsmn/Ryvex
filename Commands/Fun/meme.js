const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Send a random meme."),

  async execute(interaction) {
    try {
      const res = await fetch("https://www.reddit.com/r/shitposting/random/.json");
      const data = await res.json();

      if (
        !Array.isArray(data) ||
        !data[0]?.data?.children?.length ||
        !data[0].data.children[0]?.data
      ) {
        return interaction.reply({
          content: "❌ Couldn't fetch a meme right now. Try again later!",
          flags: MessageFlags.Ephemeral,
        });
      }

      const meme = data[0].data.children[0].data;

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setImage(meme.url)
        .setURL(`https://reddit.com${meme.permalink}`)
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Meme command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Couldn't fetch a meme right now. Try again later!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
