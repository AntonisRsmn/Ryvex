const { EmbedBuilder } = require("@discordjs/builders");
const { GuildMember, Embed } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    execute(member) {
        const { user, guild } = member;

        const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === "1012717996470452335");

        if(welcomeChannel) {
            const role = member.guild.roles.cache.find(role => role.id === "1012717995451236445");
            member.roles.add(role);

            const welcomeEmbed = new EmbedBuilder()
                .setTitle("***New member!***")
                .setDescription(`Welcome <@${member.id}> to ***Ryvex™ Support*** Hope you have great time here`)
                .setColor(0xfffffe)
                .setTimestamp();

            welcomeChannel.send({ embeds: [welcomeEmbed] });
        }
    }
}