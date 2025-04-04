const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
        option.setName("target")
        .setDescription("member to be banned.")
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName("reason")
        .setDescription("Reason for the ban.")
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

            await member.ban({reason});

            const embed = new EmbedBuilder()
                .setDescription(`Succesfully banned ${user} with reason ${reason}`)
                .setColor("#FFFFFE")
                .setTimestamp();

            await interaction.reply({
                embeds: [embed], flags: 64
            });
        }
}
