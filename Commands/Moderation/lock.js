const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a given channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
        option.setName("channel")
        .setDescription("The channel to lock.")
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName("reason")
        .setDescription("Reason for the lock.")
        ),

    async execute (interaction) {
        const { guild, options } = interaction;

        const channel = options.getChannel("channel");
        const reason = options.getString("reason") || "No reason provided";

        const errEmbed = new EmbedBuilder()
        .setDescription(`The channel ***${channel}*** is already locked.`)
        .setColor("#FF0000")

        if (!channel.permissionsFor(guild.id).has("SendMessages"))
        return interaction.reply({
            embeds: [errEmbed],
            ephemeral: true
        })

        channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false })

        const embed = new EmbedBuilder()
        .setDescription(`The channel ***${channel}*** has been locked with reson ***${reason}***`)
        .setColor("#FFFFFE")

        await interaction.reply({ embeds: [embed] })
    }
}
