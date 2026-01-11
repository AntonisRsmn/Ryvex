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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modlog")
    .setDescription("View moderation logs.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    // 🔹 RECENT (WITH ACTION FILTER)
    .addSubcommand(sub =>
      sub
        .setName("recent")
        .setDescription("View recent moderation cases")
        .addStringOption(opt =>
          opt
            .setName("action")
            .setDescription("Filter by action (warn, kick, ban, timeout, etc.)")
            .setRequired(false)
        )
    )

    // 🔹 USER HISTORY (PAGINATED)
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
    const sub = interaction.options.getSubcommand();

    /* ───────── RECENT ───────── */
    if (sub === "recent") {
      const actionFilter = interaction.options.getString("action");

      const query = { guildId };
      if (actionFilter) {
        query.action = new RegExp(`^${actionFilter}$`, "i");
      }

      const cases = await ModAction.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      if (!cases.length) {
        return interaction.editReply("❌ No moderation cases found.");
      }

      const embed = new EmbedBuilder()
        .setTitle(
          actionFilter
            ? `🛡 Recent ${actionFilter} Cases`
            : "🛡 Recent Moderation Cases"
        )
        .setColor("Red")
        .setDescription(
          cases
            .map(
              c =>
                [
                  `**#${c.caseId} • ${c.action}**`,
                  `👤 **Target:** ${c.targetTag}`,
                  `🛠 **Moderator:** ${c.moderatorTag}`,
                  `🔎 \`/case view ${c.caseId}\``,
                ].join("\n")
            )
            .join("\n\n")
        )
        .setFooter({
          text: "Tip: /modlog recent action:<name>",
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── USER PAGINATED ───────── */
    if (sub === "user") {
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

        return new EmbedBuilder()
          .setTitle(`🛡 Moderation History — ${user.tag}`)
          .setColor("Red")
          .setDescription(
            slice
              .map(
                c =>
                  [
                    `**#${c.caseId} • ${c.action}**`,
                    `🛠 ${c.moderatorTag}`,
                    `🔎 \`/case view ${c.caseId}\``,
                  ].join("\n")
              )
              .join("\n\n")
          )
          .setFooter({
            text: `Page ${page + 1} / ${totalPages}`,
          })
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
            content: "❌ This menu isn't for you.",
            ephemeral: true,
          });
        }

        if (i.customId === "prev") page--;
        if (i.customId === "next") page++;

        row.components[0].setDisabled(page === 0);
        row.components[1].setDisabled(page >= totalPages - 1);

        await i.update({
          embeds: [buildEmbed()],
          components: [row],
        });
      });
    }
  },
};
