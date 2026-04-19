
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { getBirthday, setBirthday, setGuildConfig, getConfig, resetConfig, enableBirthday } = require('../../Utils/birthdayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Birthday system: set your birthday, or configure announcements.')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set your birthday (MM-DD)')
        .addStringOption(opt =>
          opt.setName('date')
            .setDescription('Your birthday in MM-DD format')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('me')
        .setDescription('View your saved birthday')
    )
    .addSubcommand(sub =>
      sub.setName('today')
        .setDescription('See today\'s birthdays and server anniversary')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    // User birthday set/view
    if (sub === 'set') {
      const date = interaction.options.getString('date');
      if (!/^\d{2}-\d{2}$/.test(date)) {
        return interaction.reply({ content: 'Please use MM-DD format (e.g., 04-19).', flags: MessageFlags.Ephemeral });
      }
      setBirthday(userId, guildId, date);
      return interaction.reply({ content: `Your birthday has been set to ${date}! 🎂`, flags: MessageFlags.Ephemeral });
    }
    if (sub === 'me') {
      const bday = getBirthday(userId, guildId);
      const embed = new EmbedBuilder()
        .setTitle('🎂 Your Birthday')
        .setColor(0xF5B041)
        .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'Ryvex • Birthday System', iconURL: interaction.client.user.displayAvatarURL({ size: 128 }) })
        .setTimestamp();
      if (!bday) {
        embed.setDescription('You have not set a birthday yet. Use `/birthday set` to add yours!');
      } else {
        embed.setDescription(`Your birthday is set to **${bday}**. 🎉\nWe'll celebrate you in style!`);
      }
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }



    // Birthday/anniversary check
    if (sub === 'today') {
      const today = new Date();
      const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const birthdays = getBirthday(null, guildId, mmdd); // get all for today
      const embed = new EmbedBuilder()
        .setTitle('🎉 Birthdays & Anniversaries Today')
        .setColor(0xF5B041)
        .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'Ryvex • Birthday System', iconURL: interaction.client.user.displayAvatarURL({ size: 128 }) })
        .setTimestamp();
      if (birthdays && birthdays.length) {
        embed.setDescription(`🎂 **Today's Birthdays:**\n${birthdays.map(u => `<@${u.userId}>`).join(', ')}`);
      } else {
        embed.setDescription('No birthdays today.');
      }
      return interaction.reply({ embeds: [embed] });
    }
  }
};
