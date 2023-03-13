const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Answer a yes or no question.")
  .addStringOption(option => option.setName('question')
  .setDescription("Question to answer.")
  .setRequired(true)
  ),
  
  async execute(interaction) {
    const { options } = interaction;
    
    var responses = [
      "As I see it, yes.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don’t count on it.",
      "It is certain.",
      "It is decidedly so.",
      "Most likely.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Outlook good.",
      "Reply hazy, try again.",
      "Signs point to yes.",
      "Very doubtful.",
      "Without a doubt.",
      "Yes.",
      "Yes – definitely.",
      "You may rely on it."]
      
    const answer = options.getString("question");
    const response = responses[Math.floor(Math.random() * responses.length)];
      
    const embed = new EmbedBuilder()
      .setTitle('8Ball')
      .addFields(
        { name: 'Question: ', value: `${answer}`, inline: true},
        { name: 'Answer: ', value: `${response}`, inline: true},
        )
        .setColor(0xFFFFFE)
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
    
    });  
  }    
}