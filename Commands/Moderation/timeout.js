const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a member from the guild.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName("target")
                .setDescription("member to be timeout.")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("time")
                .setDescription("How long should the timeout last (Up to 27 days).")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("Reason for the timeout.")
        ),

    async execute(interaction) {
        const { guild, options } = interaction;

        const user = options.getUser("target");
        const member = guild.members.cache.get(user.id);
        const time = options.getString("time");
        const convertedTime = ms(time);
        const reason = options.getString("reason") || 'No reason provided';

        const errEmbed = new EmbedBuilder()
            .setDescription("Something went wrong")
            .setColor(0xfffffe)

        const embed = new EmbedBuilder()
            .setTitle("**Timeout**")
            .setDescription(`Succesfully timed out ${user}.`)
            .addFields(
                { name: "Reason", value: `${reason}`, inline: true },
                { name: "Duration", value: `${time}`, inline: true }
            )
            .setColor(0xfffffe)
            .setTimestamp();

        if (member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply({ embeds: [errEmbed], flags: 64});

        if (!convertedTime)
            return interaction.reply({ embeds: [errEmbed], flags: 64});

        try {
            await member.timeout(convertedTime, reason);

            return interaction.reply({ embeds: [embed], flags: 64});
        } catch (err) {
            console.log(err);
        }
    }
}