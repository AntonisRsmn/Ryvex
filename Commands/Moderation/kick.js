const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
        option.setName("target")
        .setDescription("member to be kicked.")
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName("reason")
        .setDescription("Reason for the kick.")
        ),

        async execute(interaction) {
            const { channel, options } = interaction;

            const user = options.getUser("target");
            const reason = options.getString("reason") || "No reason provided";

            const member = await interaction.guild.members.fetch(user.id);

            const errEmbed = new EmbedBuilder()
                .setDescription(`You can't take action on ${user.username} since they have a higher role.`)
                .setColor("#FF0000")

            if (member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({ embeds: [errEmbed], flags: 64 });

            await member.kick({reason});

            const embed = new EmbedBuilder()
                .setDescription(`Succesfully kicked ${user} with reason ${reason}`)
                .setColor("#FFFFFE")
                .setTimestamp();

            await interaction.reply({
                embeds: [embed], flags: 64
            });
        }
}
