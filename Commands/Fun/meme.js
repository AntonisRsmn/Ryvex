const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch= (...args) => import("node-fetch").then(({ default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends some funny memes."),

    async execute(interaction) {

        await fetch("https://www.reddit.com/r/shitposting/random/.json").then(async res => {
            let meme = await res.json();

            let title = meme[0].data.children[0].data.title;
            let url = meme[0].data.children[0].data.url;
            let author = meme[0].data.children[0].data.author;

            const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setImage(`${url}`)
            .setURL(url)
            .setColor("fffffe")

            return interaction.reply({ embeds: [embed] });
        });
    }
}