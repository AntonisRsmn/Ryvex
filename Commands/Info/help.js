const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, Client, } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a list of all the commands from Zepp."),
    async execute(interaction) {
        const emojis = {
            info:"📝",
            moderation: "🛠",
            fun: "🎮",
            owner: "👑"
        };

        const directories = [
            ...new Set(interaction.client.commands.map((cmd) => cmd.folder)),
        ];

        const formatString = (str) => 
            `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
        
        const categories = directories.map((dir) => {
            const getCommands = interaction.client.commands
            .filter((cmd) => cmd.folder === dir)
            .map((cmd) => {
                return {
                    name: cmd.data.name,
                    description: cmd.data.description || "There is no description for this command.",
                };
            });

            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });

        const embed = new EmbedBuilder()
        .setDescription("Please choose a category in the dropdown menu"
        )
        .setColor("#FFFFFE");

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId("help-menu")
                .setPlaceholder("Please select a category")
                .setDisabled(state)
                .setOptions(
                    categories.map((cmd) => {
                        return {
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `Commands from ${cmd.directory} category.`,
                            emoji: emojis[cmd.directory.toLowerCase() || null],
                        };
                    })
                )
            ),
        ];

        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
        });

        const filter = (interaction) =>
        interaction.user.id === interaction.member.id;

        const collector = initialMessage.createMessageComponentCollector({
            filter,
            compontentType: ComponentType.StringSelect,
        });

        collector.on("collect", (i) => {
            const [directory] = i.values;
            const category = categories.find(
                (x) => x.directory.toLowerCase() === directory
            );

            const categoryEmbed = new EmbedBuilder()
            .setTitle(`***${formatString(directory)} commands***`)
            .setDescription(
                `A list of all the commands categorized under ${directory}`
            )
            .setColor("#FFFFFE")
            .addFields(
                category.commands.map((cmd) => {
                    return {
                        name: `***${cmd.name}***`,
                        value: cmd.description,
                        inline: true,
                    };
                })
            );

            i.update({ embeds: [categoryEmbed] });
        });

        collector.on("end", () => {
            initialMessage.edit({ components: components(true) });
        });
    },
};
