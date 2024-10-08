const { SlashCommandBuilder, EmbedBuilder, Client } = require("discord.js");
const cpuStat = require("cpu-stat");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Get information about the bot."),

    async execute(interaction, client) {
        const days = Math.floor(client.uptime / 86400000)
        const hours = Math.floor(client.uptime / 3600000) % 24
        const minutes = Math.floor(client.uptime / 600000) % 60
        const seconds = Math.floor(client.uptime / 1000) % 60

        cpuStat.usagePercent(function (error, percent) {
            if(error) return interaction.reply({ context: `${error}`})

            const memoryUsage = formatBytes(process.memoryUsage().heapUsed)
            const node = process.version
            const cpu = percent.toFixed(2)

            const embed = new EmbedBuilder()
            .setTitle(`***${client.user.username} Inforation***`)
            .setColor("#fffffe")
            .setTimestamp()
            .addFields(
                { name: "Developer: ",value: "Rusman", inline: true},
                { name: "Username: ",value: `${client.user.username}`, inline: true},
                { name: "ID: ",value: `${client.user.id}`, inline: true},
                { name: "Active since: ",value: "Sep 1, 2022", inline: true},
                { name: "Help Command: ",value: "</help:1084950800398303267>", inline: true},
                { name: "Node version: ",value: `${node}`, inline: true},
                { name: "Bot-ping: ",value: `${client.ws.ping} ms`, inline: true},
                { name: "CPU usage: ",value: `${cpu}`, inline: true},
                { name: "Memory usage: ",value: `${memoryUsage}`, inline: true},
                { name: "Uptime", value: ` \`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes and \`${seconds}\` seconds.`, inline: true},
            )
            .setFooter({
                text: `By ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
              })

            interaction.reply({ embeds: [embed] })
        })

        function formatBytes(a, b) {
            let c = 1024
            d = b || 2
            e = ["B", "KB", "MB", "GB", "TB"]
            f = Math.floor(Math.log(a) / Math.log(c))

            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + "" + e[f]
        }
    }
}