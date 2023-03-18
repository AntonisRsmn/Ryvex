const { EmbedBuilder } = require("@discordjs/builders");
const { GuildMember, Embed } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    execute(member) {
        const { user, guild } = member;
        const welcomeChannel = member.guild.channels.cache.get("1012717996470452335");

        const welcomeEmbed = new EmbedBuilder()
        .setTitle("***New member!***")
        .setDescription(`Welcome <@${member.id}> to ***Roumy™ Support***`)
        .setColor(0xfffffe)
        .setTimestamp();

        welcomeChannel.send({ embeds: [welcomeEmbed]});
    }
}