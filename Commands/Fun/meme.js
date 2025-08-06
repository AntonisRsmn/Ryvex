const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const fetch= (...args) => import("node-fetch").then(({ default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends some funny memes."),

    async execute(interaction) {
        try {
            const res = await fetch("https://www.reddit.com/r/shitposting/random/.json");
            const meme = await res.json();

            if (
                !Array.isArray(meme) ||
                !meme[0]?.data?.children?.length ||
                !meme[0].data.children[0]?.data
            ) {
                return interaction.reply({ content: "Couldn't fetch a meme right now. Try again later!", ephemeral: true });
            }

            const { title, url, author } = meme[0].data.children[0].data;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setImage(url)
                .setURL(url)
                .setColor("fffffe")
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            return interaction.reply({ content: "Couldn't fetch a meme right now. Try again later!", flags: MessageFlags.Ephemeral });
        }
    }
}