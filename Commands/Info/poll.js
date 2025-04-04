const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll and send it to a certai channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("description")
      .setDescription("Describe the poll.")
      .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName("channel")
      .setDescription("Where do you want to send the poll to ?.")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
    ),

    async execute(interaction) {
        const { options } = interaction;

        const channel = options.getChannel("channel");
        const description = options.getString("description");

        const embed = new EmbedBuilder()
        .setColor("fffffe")
        .setTitle("Poll")
        .setDescription(description)
        .setFooter({
          text: `By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

        const embedd = new EmbedBuilder()
        .setColor("fffffe")
        .setTitle(`Poll was succesfully sent to ${channel}.`)
        .setTimestamp();

        try {
            const m = await channel.send({ embeds: [embed] });
            await m.react("✅");
            await m.react("❌");
            await interaction.reply({ embeds: [embedd], flags: 64 });
        } catch (err) {
            console.log(err);
        }
    }
}
