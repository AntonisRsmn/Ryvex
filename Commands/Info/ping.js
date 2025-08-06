const { SlashCommandBuilder, EmbedBuilder, Embed, Client } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Latency of the bot."),

    async execute(interaction, client) {
      try {
      
      const embed = new EmbedBuilder()
        .setTitle("Pong!")
        .setDescription(`${Math.round(client.ws.ping)}ms.`)
        .setColor(0xFFFFFE)
        .setFooter({
          text: `By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
      });
      
      } catch (err) {
        await interaction.reply({ content: "There was an error.", flags: 64 });
    }
  }    
}