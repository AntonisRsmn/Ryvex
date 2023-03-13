const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName("compliment")
  .setDescription("Gives you compliment."),
  
  async execute(interaction) {
    
    var compliments = [
      "You’re that “Nothing” when people ask me what I’m thinking about.",
      "You look great today.",
      "You’re a smart cookie.",
      "I bet you make babies smile.",
      "You have impeccable manners.",
      "I like your style.",
      "You have the best laugh.",
      "I appreciate you.",
      "You are the most perfect you there is.",
      "Our system of inside jokes is so advanced that only you and I get it. And I like that.",
      "You’re strong.",
      "Your perspective is refreshing.",
      "You’re an awesome friend.",
      "You light up the room.",
      "You deserve a hug right now.",
      "You should be proud of yourself.",
      "You’re more helpful than you realize.",
      "You have a great sense of humor.",
      "You’ve got all the right moves!",
      "Is that your picture next to “charming” in the dictionary?",
      "Your kindness is a balm to all who encounter it.",
      "You’re all that and a super-size bag of chips.",
      "On a scale from 1 to 10, you’re an 11.",
      "You are brave.",
      "You’re even more beautiful on the inside than you are on the outside.",
      "You have the courage of your convictions.",
      "Aside from food. You’re my favorite.",
      "If cartoon bluebirds were real, a bunch of them would be sitting on your shoulders singing right now.",
      "You are making a difference.",
      "You’re like sunshine on a rainy day.",
      "You bring out the best in other people.",
      "Your ability to recall random factoids at just the right time is impressive.",
      "You’re a great listener.",
      "How is it that you always look great, even in sweatpants?",
      "Everything would be better if more people were like you!",
      "I bet you sweat glitter.",
      "You were cool way before hipsters were cool.",
      "That color is perfect on you.",
      "Hanging out with you is always a blast.",
      "You always know — and say — exactly what I need to hear when I need to hear it.",
      "You smell really good.",
      "You may dance like no one’s watching, but everyone’s watching because you’re an amazing dancer!",
      "Being around you makes everything better!",
      "When you say, “I meant to do that,” I totally believe you.",
      "When you’re not afraid to be yourself is when you’re most incredible.",
      "Colors seem brighter when you’re around.",
      "You’re more fun than a ball pit filled with candy. (And seriously, what could be more fun than that?)",
      "That thing you don’t like about yourself is what makes you so interesting.",
      "You’re wonderful.",
      "Everyday is just BLAH when I don’t see you For reals!",]
      
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
      
    const embed = new EmbedBuilder()
      .setTitle('Compliment')
      .setDescription(`${compliment}`)
      .setColor(0xFFFFFE)
      .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
    
    });  
  }    
}