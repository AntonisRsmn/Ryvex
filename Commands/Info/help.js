const {
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a list of all Ryvex commands."),

  async execute(interaction) {
    try {
      const emojis = {
        info: "📝",
        moderation: "🛠",
        fun: "🎮",
        music: "🎶",
      };

      const client = interaction.client;

      const directories = [
        ...new Set(client.commands.map(cmd => cmd.folder)),
      ];

      const format = str =>
        `${str.charAt(0).toUpperCase()}${str
          .slice(1)
          .toLowerCase()}`;

      const categories = directories.map(dir => {
        const commands = client.commands
          .filter(cmd => cmd.folder === dir)
          .map(cmd => ({
            name: cmd.data.name,
            description:
              cmd.data.description || "No description provided.",
          }));

        return {
          directory: dir.toLowerCase(),
          display: format(dir),
          commands,
        };
      });

      const baseEmbed = new EmbedBuilder()
        .setDescription("Select a category from the menu below.")
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      const menu = disabled =>
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help-menu")
            .setPlaceholder("Choose a command category")
            .setDisabled(disabled)
            .addOptions(
              categories.map(cat => ({
                label: cat.display,
                value: cat.directory,
                description: `Commands from the ${cat.display} category.`,
                emoji: emojis[cat.directory] ?? undefined,
              }))
            )
        );

      // ✅ Initial slash response via respond()
      const message = await respond(interaction, {
        embeds: [baseEmbed],
        components: [menu(false)],
        flags: MessageFlags.Ephemeral,
      });

      // ⚠️ respond() must return the message for this to work
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60_000,
        filter: i => i.user.id === interaction.user.id,
      });

      collector.on("collect", async i => {
        const selected = categories.find(
          c => c.directory === i.values[0]
        );

        const categoryEmbed = new EmbedBuilder()
          .setTitle(`${selected.display} Commands`)
          .setColor("White")
          .addFields(
            selected.commands.map(cmd => ({
              name: `/${cmd.name}`,
              value: cmd.description,
              inline: true,
            }))
          )
          .setTimestamp();

        await i.update({ embeds: [categoryEmbed] });
      });

      collector.on("end", async () => {
        await message.edit({ components: [menu(true)] });
      });
    } catch (error) {
      console.error("Help command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to load the help menu.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
