const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const GuildSettings = require("../../Database/models/GuildSettings");

const MAX_CHARS = 3500;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("View the server rules"),

  async execute(interaction) {
    const settings = await GuildSettings.findOne({ guildId: interaction.guild.id });

    if (!settings || !settings.rules?.enabled || !settings.rules.text) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "📜 This server has not set up rules yet.",
      });
    }

    const chunks = settings.rules.text.match(
      new RegExp(`(.|[\r\n]){1,${MAX_CHARS}}`, "g")
    );

    let page = 0;

    const getEmbed = () =>
      new EmbedBuilder()
        .setTitle("📜 Server Rules")
        .setDescription(chunks[page])
        .setColor(0x2f3136)
        .setFooter({
          text: `Page ${page + 1} / ${chunks.length}`,
        });

    if (chunks.length === 1) {
      return interaction.reply({ embeds: [getEmbed()] });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("rules_prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("rules_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.reply({
      embeds: [getEmbed()],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ flags: MessageFlags.Ephemeral, content: "This menu isn't for you." });
      }

      if (i.customId === "rules_next") page++;
      if (i.customId === "rules_prev") page--;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === chunks.length - 1);

      await i.update({
        embeds: [getEmbed()],
        components: [row],
      });
    });

    collector.on("end", () => {
      row.components.forEach((btn) => btn.setDisabled(true));
      message.edit({ components: [row] }).catch(() => {});
    });
  },
};
