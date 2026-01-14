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

/* ───────── ACTION META ───────── */
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
    .setName("modlog")
    .setDescription("View moderation logs.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub
        .setName("user")
        .setDescription("View moderation history for a user")
        .addUserOption(opt =>
          opt.setName("member").setDescription("Target member").setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const user = interaction.options.getUser("member");

    const cases = await ModAction.find({
      guildId,
      targetId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!cases.length) {
      return interaction.editReply(
        `❌ No moderation history found for **${user.tag}**.`
      );
    }

    let page = 0;
    const totalPages = Math.ceil(cases.length / PAGE_SIZE);

    const buildEmbed = () => {
      const slice = cases.slice(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE
      );

      const description = slice
        .map(c => {
          const icon = ACTION_META[c.action] ?? "❓";
          return [
            `**${icon} #${c.caseId} • ${c.action}**`,
            `🛠 ${c.moderatorTag}`,
            `🔎 \`/case view ${c.caseId}\``,
          ].join("\n");
        })
        .join("\n\n");

      return new EmbedBuilder()
        .setTitle(`🛡 Moderation History — ${user.tag}`)
        .setColor("Red")
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

      if (!i.deferred && !i.replied) {
        await i.deferUpdate().catch(() => {});
      }

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      page = Math.max(0, Math.min(page, totalPages - 1));

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await interaction
        .editReply({
          embeds: [buildEmbed()],
          components: [row],
        })
        .catch(() => {});
    });

    collector.on("end", async () => {
      row.components.forEach(b => b.setDisabled(true));
      await interaction.editReply({ components: [row] }).catch(() => {});
    });
  },
};
