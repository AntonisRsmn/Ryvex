const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("add-role")
    .setDescription("Add a role to a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option.setName("target")
        .setDescription("User to add the role.")
        .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName("role")
        .setDescription("Role to add to the user.")
        .setRequired(true)
    ),

    async execute(interaction, client) {
        const user = interaction.options.getUser("target");
        const role = interaction.options.getRole("role");
        const member = await interaction.guild.members.fetch(user.id);

        if (member.roles.cache.has(role.id)) {
            const embed = new EmbedBuilder()
            .setColor("fffffe")
            .setDescription(`User ${user} already has the role ${role}.`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Requested By ${interaction.user.tag}`})
            .setTimestamp()
            await interaction.reply({ embeds: [embed], ephemeral: true })
            return;
        }

        try {
            await interaction.guild.members.cache.get(user.id).roles.add(role)
            const embed = new EmbedBuilder()
            .setColor("fffffe")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Succesfully added role ${role} to ${user}.`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`})
            .setTimestamp()

            await interaction.reply({ embeds: [embed], ephemeral: true })
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
            .setDescription(`Faild to add role ${role} to user ${user}.`)

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}