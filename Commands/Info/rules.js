const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const GuildRules = require("../../Database/models/GuildRules");

const RULES_PER_PAGE = 3;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("View the server rules"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const data = await GuildRules.findOne({
      guildId: interaction.guild.id,
    });

    if (!data || !data.rules.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📜 Server Rules")
            .setColor("Red")
            .setDescription(
              "⚠️ **No rules have been configured yet.**\n\n" +
              "Please contact a moderator if this seems incorrect."
            )
            .setTimestamp(),
        ],
      });
    }

    const rules = data.rules.sort((a, b) => a.id - b.id);
    const totalPages = Math.ceil(rules.length / RULES_PER_PAGE);

    let page = 0;

    const buildEmbed = () => {
      const slice = rules.slice(
        page * RULES_PER_PAGE,
        page * RULES_PER_PAGE + RULES_PER_PAGE
      );

      const description = [];

      if (page === 0) {
        description.push(
          "Please read and follow all rules below.",
          "Breaking rules may result in moderation actions.",
          ""
        );
      }

      for (const r of slice) {
        description.push(
          `**Rule ${r.id}. ${r.title}**`,
          `> ${r.description}`,
          ""
        );
      }

      return new EmbedBuilder()
        .setTitle(`📜 Server Rules — ${interaction.guild.name}`)
        .setColor("Blue")
        .setDescription(description.join("\n"))
        .setFooter({
          text: `Ryvex • ${rules.length} rule${rules.length !== 1 ? "s" : ""} • Page ${page + 1}/${totalPages}`,
        })
        .setTimestamp();
    };

    /* ───────── SINGLE PAGE — no buttons needed ───────── */
    if (totalPages === 1) {
      return interaction.editReply({ embeds: [buildEmbed()] });
    }

    /* ───────── MULTI-PAGE ───────── */
    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("rules_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("rules_next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1),
      );

    const message = await interaction.editReply({
      embeds: [buildEmbed()],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This menu isn't for you.",
          ephemeral: true,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "rules_prev") page--;
      if (i.customId === "rules_next") page++;
      page = Math.max(0, Math.min(page, totalPages - 1));

      await interaction.editReply({
        embeds: [buildEmbed()],
        components: [buildRow()],
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        ...buildRow().components.map(b => b.setDisabled(true))
      );
      await interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  },
};
