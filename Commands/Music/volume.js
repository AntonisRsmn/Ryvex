const { VolumeInterface } = require("discord.js");
const { EmbedBuilder, SlashCommandBuilder, PermissioFlagsBits, VoiceChannel, GuildEmoji } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Adjust the song volume.")
    .addIntegerOption(option =>
        option.setName("volume")
            .setDescription("10 = 10%")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
    ),
    async execute(interaction) {
        const {options, member, guild } = interaction;

        const volume = options.getInteger("volume");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!voiceChannel) {
            embed.setColor("Red").setDescription("You must be in a voice channel to execute this command.").setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (guild.members.me.voice.channelId !== null) {
            if (member.voice.channelId !== guild.members.me.voice.channelId) {
                embed.setColor("Red").setDescription(`You can't use this music player as it is already active in <#${guild.members.me.voice.channelId}>`).setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        try {

            client.distube.setVolume(voiceChannel, volume);
            embed.setColor("Green").setDescription(`🔉 Volume has been set to ${volume}%.`).setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true});

        } catch(err) {
            console.log(err);

            embed.setColor("Red").setDescription("⛔ | Something went wrong.").setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true});
        }
    }
}