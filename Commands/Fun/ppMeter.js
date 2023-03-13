const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName("ppmeter")
      .setDescription("PP meter."),

    async execute(interaction) {
      var ppmeter = ['8=D', '8==D', '8===D', '8====D', '8=====D', '8======D', '8=======D', '8========D', '8=========D', '8==========D']
      const response = ppmeter[Math.floor(Math.random() * ppmeter.length)];
      
      const embed = new EmbedBuilder()
        .setTitle('PPmeter')
        .setDescription('Your pp is: ' + response)
        .setColor(0xFFFFFE)
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
    
    });  
  }    
}