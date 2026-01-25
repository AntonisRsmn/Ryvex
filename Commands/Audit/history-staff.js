const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");

const PAGE_SIZE = 5;

/* ───────── ACTION ICONS ───────── */
const ACTION_META = {
  Warn: "⚠️",
  Timeout: "⏳",
  "Auto Timeout": "⏳",
  Kick: "👢",
  Ban: "🔨",
  Unban: "♻️",
  "Clear Messages": "🧹",
  "Edit Case": "✏️",
  "Delete Case": "🗑️",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history-staff")
    .setDescription("View moderation history")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
        opt
        .setName("moderator")
        .setDescription("Staff member")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const moderator = interaction.options.getUser("moderator");

    const actions = await ModAction.find({
      guildId,
      moderatorId: moderator.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!actions.length) {
      return interaction.editReply(
        `❌ No moderation actions found for **${moderator.tag}**.`
      );
    }

    let page = 0;
    const totalPages = Math.ceil(actions.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = actions.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const description = slice
        .map(a => {
          const icon = ACTION_META[a.action] ?? "🛡️";
          return [
            `**${icon} #${a.caseId} • ${a.action}**`,
            `🎯 Target: ${a.targetTag}`,
            `🔎 \`/case view ${a.caseId}\``,
          ].join("\n");
        })
        .join("\n\n");

      return new EmbedBuilder()
        .setTitle(`🧑‍⚖️ Staff History — ${moderator.tag}`)
        .setColor("Blue")
        .setDescription(description)
        .setFooter({ text: `Page ${page + 1} / ${totalPages}` })
        .setTimestamp();
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
          content: "❌ This menu isn’t for you.",
          ephemeral: true,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      page = Math.max(0, Math.min(page, totalPages - 1));

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await interaction.editReply({
        embeds: [buildEmbed()],
        components: [row],
      });
    });

    collector.on("end", async () => {
      row.components.forEach(b => b.setDisabled(true));
      await interaction.editReply({ components: [row] }).catch(() => {});
    });
  },
};
