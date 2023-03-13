const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("whois")
      .setDescription("Get info about a member.")
      .addUserOption(option =>
        option.setName("target")
        .setDescription("User to get info.")
        .setRequired(true)
        ),

    async execute(interaction) {
      const { options } = interaction;
      const member = options.getUser("target");
      const avatar = member.displayAvatarURL({ size: 1024, dynamic: true });
      
      const embed = new EmbedBuilder()
        .setTitle(`${member.username}` + "'s Profile")
        .setColor(0xFFFFFE)
        .setThumbnail(avatar)
        .addFields(
          { name: 'User Tag:', value: `${member.tag}`, inline: true },
		      { name: 'ID:', value: `${member.id}`, inline: true },
		      { name: 'Joined Discord:', value: `${member.createdAt}`, inline: true },
        )
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],

    });  
  }    
}