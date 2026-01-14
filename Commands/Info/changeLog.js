const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const changeLog = require("../../Data/changeLog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("View Ryvex update history")

    .addSubcommand(sub =>
      sub
        .setName("latest")
        .setDescription("View the latest update")
    )

    .addSubcommand(sub =>
      sub
        .setName("all")
        .setDescription("Browse all updates")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!changeLog.length) {
      return interaction.editReply("❌ No changeLog data available.");
    }

    const sub = interaction.options.getSubcommand();

    /* ───────── LATEST ───────── */
    if (sub === "latest") {
      const latest = changeLog[0];

      const embed = new EmbedBuilder()
        .setTitle(`🚀 Ryvex v${latest.version}`)
        .setColor("Blue")
        .setDescription(
          [
            `📅 **Release Date:** ${latest.date}`,
            "",
            ...latest.changes.map(c => `• ${c}`),
          ].join("\n")
        )
        .setFooter({ text: "Use /changeLog all to see previous updates" });

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── PAGINATED VIEW ───────── */
    let page = 0;
    const totalPages = changeLog.length;

    const buildEmbed = () => {
      const entry = changeLog[page];

      return new EmbedBuilder()
        .setTitle(`🚀 Ryvex v${entry.version}`)
        .setColor("Blue")
        .setDescription(
          [
            `📅 **Release Date:** ${entry.date}`,
            "",
            ...entry.changes.map(c => `• ${c}`),
          ].join("\n")
        )
        .setFooter({
          text: `Version ${page + 1} / ${totalPages}`,
        });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages === 1)
    );

    const message = await interaction.editReply({
      embeds: [buildEmbed()],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      time: 60_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This menu isn't for you.",
          ephemeral: true,
        });
      }

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await i.update({
        embeds: [buildEmbed()],
        components: [row],
      });
    });
  },
};
