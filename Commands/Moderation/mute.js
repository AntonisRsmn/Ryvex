const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a member from the guild.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName("target")
                .setDescription("Select the user you wish to mute.")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("time")
                .setDescription("How long should the mute last ?.")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("What is the reason for the mute ?.")
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
            .setTitle("**Muted**")
            .setDescription(`Succesfully muted ${user}.`)
            .addFields(
                { name: "Reason", value: `${reason}`, inline: true },
                { name: "Duration", value: `${time}`, inline: true }
            )
            .setColor(0xfffffe)
            .setTimestamp();

        if (member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply({ embeds: [errEmbed], ephemeral: true});

        if (!convertedTime)
            return interaction.reply({ embeds: [errEmbed], ephemeral: true});

        try {
            await member.timeout(convertedTime, reason);

            return interaction.reply({ embeds: [embed], ephemeral: true});
        } catch (err) {
            console.log(err);
        }
    }
}