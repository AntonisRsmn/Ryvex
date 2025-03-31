const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove-role")
    .setDescription("Remove a role from a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option.setName("target")
        .setDescription("member to remove the role.")
        .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName("role")
        .setDescription("Role to remove from the member.")
        .setRequired(true)
    ),

    async execute(interaction, client) {
        const user = interaction.options.getUser("target");
        const role = interaction.options.getRole("role");
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.roles.cache.has(role.id)) {
            const embed = new EmbedBuilder()
            .setColor("fffffe")
            .setDescription(`User ${user} doesn't have the role ${role}.`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Requested By ${interaction.user.tag}`})
            .setTimestamp()
            await interaction.reply({ embeds: [embed], flags: 64 })
            return;
        }

        try {
            await interaction.guild.members.cache.get(user.id).roles.remove(role)
            const embed = new EmbedBuilder()
            .setColor("fffffe")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Succesfully removed role ${role} from ${user}.`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`})
            .setTimestamp()

            await interaction.reply({ embeds: [embed], flags: 64 })
        } catch (error) {
            console.error(error)
            const embed = new EmbedBuilder()
            .setColor("fffffe")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Requested By ${interaction.user.tag}`})
            .setTimestamp()
            .setDescription(`Faild to remove role ${role} from user ${user}.`)

            await interaction.reply({ embeds: [embed], flags: 64 })
        }
    }
}