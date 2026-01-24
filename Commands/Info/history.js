const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const { respond } = require("../../Utils/respond");

const ACTION_META = {
  Warn: "⚠️",
  Timeout: "⏳",
  "Auto Timeout": "⏳",
  Kick: "👢",
  Ban: "🔨",
  Unban: "♻️",
  AutoModSpam: "🤖",
  AutoModLinks: "🔗",
  AutoModBadWords: "🤬",
};

const PAGE_SIZE = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View your moderation history")
    .addSubcommand(sub =>
      sub.setName("me").setDescription("View your moderation history")
    ),

  async execute(interaction) {
    const actions = await ModAction.find({
      guildId: interaction.guild.id,
      targetId: interaction.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!actions.length) {
      return respond(interaction, {
        content: "✅ You have no moderation history on this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let page = 0;
    const totalPages = Math.ceil(actions.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = actions.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Moderation History — ${interaction.user.tag}`)
        .setColor("DarkRed")
        .setFooter({
          text: `Page ${page + 1} / ${totalPages}`,
        });

      for (const record of slice) {
        const icon = ACTION_META[record.action] ?? "🛡️";

        embed.addFields({
          name: `${icon} #${record.caseId} • ${record.action}`,
          value: `👮 **${record.moderatorTag || "AutoMod"}**`,
        });
      }

      return embed;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("history_prev")
        .setLabel("◀")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("history_next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages === 1)
    );

    const response = await interaction.reply({
      embeds: [buildEmbed()],
      components: [row],
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    const message = response.resource.message;

    const collector = message.createMessageComponentCollector({
      time: 2 * 60 * 1000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This menu is not for you.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (i.customId === "history_next") page++;
      if (i.customId === "history_prev") page--;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await i.update({
        embeds: [buildEmbed()],
        components: [row],
      });
    });

    collector.on("end", () => {
      row.components.forEach(btn => btn.setDisabled(true));
      message.edit({ components: [row] }).catch(() => {});
    });
  },
};
