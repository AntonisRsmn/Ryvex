const { VolumeInterface } = require("discord.js");
const { EmbedBuilder, SlashCommandBuilder, PermissioFlagsBits, VoiceChannel, GuildEmoji } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forward")
        .setDescription("Forward seconds in a song.")
        .addIntegerOption(option =>
            option.setName("seconds")
                .setDescription("Amount of seconds to forward (10 = 10s).")
                .setMinValue(0)
                .setRequired(true)
        ),
    async execute(interaction) {
        const { options, member, guild } = interaction;
        const seconds = options.getInteger("seconds");
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!voiceChannel) {
            embed.setColor("Red").setDescription("You must be in a voice channel to execute this command.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (guild.members.me.voice.channelId !== null) {
            if (member.voice.channelId !== guild.members.me.voice.channelId) {
                embed.setColor("Red").setDescription(`You can't use this music player as it is already active in <#${guild.members.me.voice.channelId}>`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        try {

            const queue = await client.distube.getQueue(voiceChannel);

            if(!queue) {
                embed.setColor("Red").setDescription("There is no active queue.");
                return interaction.reply({ embeds: [embed], ephemeral: true});
            }

            await queue.seek(queue.currentTime + seconds);
            embed.setColor("fffffe").setDescription(`⏩ Forwarded the song for \` ${seconds}\`.`);
            return interaction.reply({ embeds: [embed], ephemeral: true});

        } catch(err) {
            console.log(err);

            embed.setColor("Red").setDescription("⛔ | Something went wrong.");

            return interaction.reply({ embeds: [embed], ephemeral: true});
        }
    }
}