const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Display loop options.")
        .addStringOption(option =>
            option.setName("options")
            .setDescription("Loop options: off, song, queue")
            .addChoices(
                { name: "off", value: "off" },
                { name: "song", value: "song" },
                { name: "queue", value: "queue" },
            )
            .setRequired(true)
        ),
    async execute(interaction) {
        const { member, options, guild } = interaction;
        const option = options.getString("options");
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
            const queue = await client.distube.getQueue(voiceChannel);

            if(!queue) {
                embed.setColor("Red").setDescription("There is no active queue.").setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true});
            }

            let mode = null;

            switch (option) {
                case "off":
                    mode = 0;
                    break;
                case "song":
                    mode = 1;
                    break;
                case "queue":
                    mode = 2;
                    break;
            }

            mode = await queue.setRepeatMode(mode);

            mode = mode ? (mode === 2? "Repeat queue" : "Repeat song") : "Off";

            embed.setColor("Green").setDescription(`🔁 Set repeat mode to \`${mode}\`.`).setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true});
        } catch (err) {
            console.log(err);

            embed.setColor("Red").setDescription("⛔ | Something went wrong.").setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true});
        }
    }
}