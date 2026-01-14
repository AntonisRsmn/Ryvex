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
    .setDescription("Browse all Ryvex commands by category."),

  async execute(interaction) {
    try {
      const client = interaction.client;

      /* ───────── CATEGORY EMOJIS ───────── */
      const emojis = {
        moderation: "🛡",
        audit: "📁",
        config: "⚙️",
        fun: "🎮",
        info: "ℹ️",
      };

      /* ───────── BUILD CATEGORIES ───────── */
      const directories = [
        ...new Set(client.commands.map(cmd => cmd.folder)),
      ];

      const format = str =>
        `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;

      const categories = directories.map(dir => {
        const commands = client.commands
          .filter(cmd => cmd.folder === dir)
          .map(cmd => ({
            name: cmd.data.name,
            description: cmd.data.description || "No description provided.",
          }));

        return {
          directory: dir.toLowerCase(),
          display: format(dir),
          emoji: emojis[dir.toLowerCase()] ?? "📦",
          commands,
        };
      });

      /* ───────── HOME EMBED ───────── */
      const homeEmbed = new EmbedBuilder()
        .setTitle("🚀 Ryvex Help Center")
        .setDescription(
          [
            "Welcome to **Ryvex** 👋",
            "",
            "Use the menu below to browse commands by category.",
            "",
            "📌 *Tip:* Commands are grouped for easier discovery.",
          ].join("\n")
        )
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      /* ───────── DROPDOWN MENU ───────── */
      const menu = disabled =>
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help-category")
            .setPlaceholder("Select a command category")
            .setDisabled(disabled)
            .addOptions(
              categories.map(cat => ({
                label: cat.display,
                value: cat.directory,
                description: `${cat.display} commands`,
                emoji: cat.emoji,
              }))
            )
        );

      const message = await respond(interaction, {
        embeds: [homeEmbed],
        components: [menu(false)],
        flags: MessageFlags.Ephemeral,
      });

      /* ───────── COLLECTOR ───────── */
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60_000,
        filter: i => i.user.id === interaction.user.id,
      });

      collector.on("collect", async i => {
        const selected = categories.find(
          c => c.directory === i.values[0]
        );

        if (!selected) {
          return i.deferUpdate().catch(() => {});
        }

        const description = selected.commands
          .map(
            cmd =>
              `• **/${cmd.name}**\n  ${cmd.description}`
          )
          .join("\n\n");

        const embed = new EmbedBuilder()
          .setTitle(`${selected.emoji} ${selected.display} Commands`)
          .setDescription(description)
          .setColor("White")
          .setFooter({ text: "Use /help to return to the main menu" })
          .setTimestamp();

        await i.update({
          embeds: [embed],
          components: [menu(false)],
        });
      });

      collector.on("end", async () => {
        await message
          .edit({
            components: [menu(true)],
          })
          .catch(() => {});
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
