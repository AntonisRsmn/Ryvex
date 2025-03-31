const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
        option.setName("userid")
        .setDescription("Discord ID of the user you want to unban.")
        .setRequired(true)
    ),

    async execute(interaction) {
        const { channel, options } = interaction;

        const userId = options.getString("userid");

        try {
            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setDescription(`Succesfully unbanned id ${userId} from the guild.`)
                .setColor("#FFFFFE")
                .setTimestamp();

            await interaction.reply({
                embeds: [embed], flags: 64
            });
        } catch (err) {
            console.log(err);

            const errEmbed = new EmbedBuilder()
                .setDescription("Please provide a valid member's ID.")
                .setColor("#FF0000");

            interaction.reply({ embeds: [errEmbed], flags: 64 });
        }
    }
}
