const { VolumeInterface, PermissionsBitField } = require("discord.js");
const { EmbedBuilder, SlashCommandBuilder, PermissioFlagsBits, VoiceChannel, GuildEmoji } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addStringOption(option =>
        option.setName("query")
            .setDescription("Provide the name or the url for the song.")
            .setRequired(true)
    ),
    async execute(interaction) {
        const {options, member, guild, channel} = interaction;

        const query = options.getString("test");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!voiceChannel) {
            embed.setColor("Red").setDescription("You must be in a voice channel to execute this command.").setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!interaction.member?.voice.channel?.joinable) {
            embed.setColor("Red").setDescription("I can't join this voice channel.").setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (query.includes("https://")) {
            embed.setColor("Red").setDescription("You can't use links because of an error please try using the name of the song.").setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (guild.members.me.voice.channelId !== null) {
            if (member.voice.channelId !== guild.members.me.voice.channelId) {
                embed.setColor("Red").setDescription(`You can't use this music player as it is already active in <#${guild.members.me.voice.channelId}>`).setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        try {

            client.distube.play(voiceChannel, query, { textChannel: channel, member: member});
            embed.setColor("fffffe").setDescription("🎶 Request received.").setTimestamp();
            return interaction.reply({ embeds: [embed] })
            .then(() =>
                setTimeout(
                    () => interaction.deleteReply(),
                    5000
                )
            );

        } catch(err) {
            console.log(err);

            embed.setColor("Red").setDescription("⛔ | Something went wrong.").setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true});
        }
    }
}
