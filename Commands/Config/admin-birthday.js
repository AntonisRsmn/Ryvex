const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setGuildConfig, getConfig, resetConfig, enableBirthday } = require('../../Utils/birthdayUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-birthday')
    .setDescription('Admin: Configure birthday announcement system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable birthday announcements')
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable birthday announcements')
    )
    .addSubcommand(sub =>
      sub.setName('channel')
        .setDescription('Set the birthday announcement channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Announcement channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('message')
        .setDescription('Set custom birthday message. Use <username> to mention the user. Type "reset" to restore default.')
        .addStringOption(opt =>
          opt.setName('text')
            .setDescription('Custom birthday message. Use <username> for the member mention. Type "reset" for default.')
            .setMaxLength(1000)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('View current birthday system configuration')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'enable') {
      enableBirthday(guildId, true);
      return interaction.reply({ content: '🎂 Birthday announcements enabled!', flags: 1 << 6 });
    }
    if (sub === 'disable') {
      enableBirthday(guildId, false);
      return interaction.reply({ content: '🎂 Birthday announcements disabled.', flags: 1 << 6 });
    }
    if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel');
      setGuildConfig(guildId, { channel: channel.id });
      return interaction.reply({ content: `🎂 Birthday announcement channel set to ${channel}.`, flags: 1 << 6 });
    }
    if (sub === 'message') {
      const text = interaction.options.getString('text');
      if (text.trim().toLowerCase() === 'reset') {
        setGuildConfig(guildId, { message: null });
        return interaction.reply({ content: '🔄 Birthday message reset to default.', flags: 1 << 6 });
      } else {
        setGuildConfig(guildId, { message: text });
        return interaction.reply({ content: `✏️ Custom birthday message set to:\n${text}`, flags: 1 << 6 });
      }
    }
    if (sub === 'config') {
      const config = getConfig(guildId);
      const embed = {
        title: '🎂 Birthday System Configuration',
        color: 0xF5B041,
        fields: [
          { name: 'Enabled', value: config.enabled ? '✅ Yes' : '❌ No', inline: true },
          { name: 'Channel', value: config.channel ? `<#${config.channel}>` : 'Not set', inline: true },
          { name: 'Message', value: config.message || 'Default', inline: false },
        ],
        timestamp: new Date().toISOString(),
      };
      return interaction.reply({ embeds: [embed], flags: 1 << 6 });
    }
  }
};
