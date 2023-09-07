const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Zepp Information."),

    async execute(interaction, client) {
        const days = Math.floor(client.uptime / 86400000)
        const hours = Math.floor(client.uptime / 3600000) % 24
        const minutes = Math.floor(client.uptime / 600000) % 60
        const seconds = Math.floor(client.uptime / 1000) % 60

        const embed = new EmbedBuilder()
        .setTitle(`***${client.user.username}'s Information***`)
        .setColor("#fffffe")
        .setTimestamp()
        .addFields(
            { name: 'User Tag:', value: `${client.user.tag}`, inline: true },
		    { name: 'ID:', value: `${client.user.id}`, inline: true },
		    { name: 'Joined Discord:', value: `${client.user.createdAt}`, inline: true },
            { name: "Servers: ", value: `${client.guilds.cache.size}`, inline: true},
            { name: "Commands: ", value: "26", inline: true},
            { name: "Language: ", value: "JavaScript", inline: true},
            { name: "Uptime", value: ` \`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes and \`${seconds}\` seconds.`, inline: true},
        )

        interaction.reply({ embeds: [embed]})
    }
}
