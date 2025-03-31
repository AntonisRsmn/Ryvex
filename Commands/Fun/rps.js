const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock paper scissors against the bot.")
    .addStringOption(option =>
        option.setName("choice")
        .setDescription("Choose Rock, Paper or Scissors")
        .addChoices(
            { name: "🗻 Rock", value: "🗻 Rock" },
            { name: "🧻 Paper", value: "🧻 Paper" },
            { name: "✂ Scissors", value: "✂ Scissors" },
        )
        .setRequired(true)
    ),

    async execute(interaction) {
        const { options } = interaction;
        var list = ["🗻 Rock", "🧻 Paper", "✂ Scissors"]
        const option = options.getString("choice");
        const embed = new EmbedBuilder();
        const responce = list[Math.floor(Math.random() * list.length)];

        if (interaction.options.getString("choice") === "🗻 Rock") {
            if (responce === "🗻 Rock") {
                embed.setTitle("***It's a tie***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🗻 Rock", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "🧻 Paper") {
                embed.setTitle("***You lose***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🗻 Rock", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "✂ Scissors") {
                embed.setTitle("***You Won***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🗻 Rock", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
        }

        if (interaction.options.getString("choice") === "🧻 Paper") {
            if (responce === "🗻 Rock") {
                embed.setTitle("***You won***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🧻 Paper", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "🧻 Paper") {
                embed.setTitle("***It's a tie***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🧻 Paper", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "✂ Scissors") {
                embed.setTitle("***You lose***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "🧻 Paper", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
        }

        if (interaction.options.getString("choice") === "✂ Scissors") {
            if (responce === "🗻 Rock") {
                embed.setTitle("***You lose***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "✂ Scissors", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "🧻 Paper") {
                embed.setTitle("***You won***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "✂ Scissors", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            if (responce === "✂ Scissors") {
                embed.setTitle("***It's a tie***")
                .setColor("FFFFFE")
                .addFields(
                    { name: "Your choice: ", value: "✂ Scissors", inline: true },
                    { name: "My choice: ", value: `${responce}`, inline: true },
                )
                .setFooter({
                    text: `By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
                .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
        }
    }
}