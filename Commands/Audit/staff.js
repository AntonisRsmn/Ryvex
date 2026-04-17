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
const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

const COUNTED_ACTIONS = [
  "Warn",
  "Timeout",
  "Auto Timeout",
  "Kick",
  "Ban",
  "Unban",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff")
    .setDescription("Staff accountability & audit tools")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub
        .setName("dashboard")
        .setDescription("View staff moderation activity summary")
        .addStringOption(opt =>
          opt
            .setName("range")
            .setDescription("Time range")
            .addChoices(
              { name: "Last 7 days", value: "7" },
              { name: "Last 14 days", value: "14" },
              { name: "Last 30 days", value: "30" },
              { name: "All time", value: "all" }
            )
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const range = interaction.options.getString("range") ?? "7";
    const settings = await getGuildSettings(guildId);

    const query = {
      guildId,
      action: { $in: COUNTED_ACTIONS },
    };

    let rangeLabel = "Last 7 days";

    if (range !== "all") {
      const days = parseInt(range, 10);
      query.createdAt = {
        $gte: new Date(Date.now() - days * 86400000),
      };
      rangeLabel = `Last ${days} days`;
    } else {
      rangeLabel = "All time";
    }

    const actions = await ModAction.find(query).sort({ createdAt: -1 }).lean();

    if (!actions.length) {
      const embed = new EmbedBuilder()
        .setTitle("📊 Staff Dashboard")
        .setColor("Red")
        .setDescription("❌ No moderation activity found for this period.")
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── STAFF MAP ───────── */
    const staffMap = new Map();
    const actionTypeCounts = {};

    for (const a of actions) {
      if (!staffMap.has(a.moderatorId)) {
        staffMap.set(a.moderatorId, {
          tag: a.moderatorTag,
          total: 0,
          actions: {},
        });
      }
      const staff = staffMap.get(a.moderatorId);
      staff.total++;
      staff.actions[a.action] = (staff.actions[a.action] || 0) + 1;

      actionTypeCounts[a.action] = (actionTypeCounts[a.action] || 0) + 1;
    }

    const sortedStaff = [...staffMap.entries()].sort(
      (a, b) => b[1].total - a[1].total
    );

    const alertsCount = settings.staffMonitoring?.alerts?.length ?? 0;
    const monitoringOn = settings.staffMonitoring?.enabled === true;

    /* ───────── RECENT ACTIVITY ───────── */
    const recent5 = actions.slice(0, 5);

    /* ───────── BUSIEST DAY ───────── */
    const dayCounts = {};
    for (const a of actions) {
      const day = new Date(a.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
      });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

    /* ═══════════════════════════════════════
       PAGES
       ═══════════════════════════════════════ */
    const pages = [

      /* ───── PAGE 1: OVERVIEW ───── */
      new EmbedBuilder()
        .setTitle("🧑‍⚖️ Staff Dashboard — Overview")
        .setColor("Blue")
        .setDescription(
          [
            `📅 **Range:** ${rangeLabel}`,
            `👥 **Active staff:** ${staffMap.size}`,
            `📋 **Total actions:** ${actions.length}`,
            "",
            "**Monitoring:**",
            `> Status: ${monitoringOn ? "🟢 ON" : "🔴 OFF"}`,
            `> Alerts on record: **${alertsCount}**`,
            alertsCount > 0
              ? "> ⚠️ Run `/staff-flags check` to review alerts."
              : "",
            "",
            "**Action breakdown:**",
            ...(actionTypeCounts["Warn"]
              ? [`> ⚠️ Warns: **${actionTypeCounts["Warn"]}**`] : []),
            ...(actionTypeCounts["Timeout"] || actionTypeCounts["Auto Timeout"]
              ? [`> ⏳ Timeouts: **${(actionTypeCounts["Timeout"] ?? 0) + (actionTypeCounts["Auto Timeout"] ?? 0)}**`] : []),
            ...(actionTypeCounts["Kick"]
              ? [`> 👢 Kicks: **${actionTypeCounts["Kick"]}**`] : []),
            ...(actionTypeCounts["Ban"]
              ? [`> 🔨 Bans: **${actionTypeCounts["Ban"]}**`] : []),
            ...(actionTypeCounts["Unban"]
              ? [`> ♻️ Unbans: **${actionTypeCounts["Unban"]}**`] : []),
            "",
            busiestDay
              ? `📆 **Busiest day:** ${busiestDay[0]} (${busiestDay[1]} actions)`
              : "",
            "",
            "Use ◀ ▶ to browse pages.",
          ].filter(Boolean).join("\n")
        ),

      /* ───── PAGE 2: STAFF LEADERBOARD ───── */
      new EmbedBuilder()
        .setTitle("📊 Staff Leaderboard")
        .setColor("Blue")
        .setDescription(
          [
            `📅 **Range:** ${rangeLabel}`,
            "",
            ...sortedStaff.slice(0, 15).map(([id, data], idx) => {
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `**${idx + 1}.**`;
              const breakdown = Object.entries(data.actions)
                .map(([action, count]) => `${count} ${action.toLowerCase()}${count !== 1 ? "s" : ""}`)
                .join(", ");
              return `${medal} **${data.tag}** — ${data.total} action${data.total !== 1 ? "s" : ""}\n> ${breakdown}`;
            }),
            "",
            sortedStaff.length > 15
              ? `+ ${sortedStaff.length - 15} more staff members`
              : "",
          ].filter(Boolean).join("\n")
        ),

      /* ───── PAGE 3: RECENT ACTIVITY ───── */
      new EmbedBuilder()
        .setTitle("🕐 Recent Activity")
        .setColor("Blue")
        .setDescription(
          [
            `📅 **Range:** ${rangeLabel}`,
            "",
            "**Last 5 actions:**",
            "",
            ...recent5.map(a => {
              const ts = Math.floor(new Date(a.createdAt).getTime() / 1000);
              const icon = {
                Warn: "⚠️", Timeout: "⏳", "Auto Timeout": "⏳",
                Kick: "👢", Ban: "🔨", Unban: "♻️",
              }[a.action] ?? "🛡️";
              return [
                `${icon} **#${a.caseId} • ${a.action}**`,
                `> 🎯 ${a.targetTag} • 🛠 ${a.moderatorTag}`,
                `> 📝 ${(a.reason ?? "No reason").slice(0, 80)}`,
                `> 🕐 <t:${ts}:R>`,
              ].join("\n");
            }),
            "",
            "**Quick commands:**",
            "> `/history-staff @mod` — view a specific mod's full history",
            "> `/case view <id>` — see full case details",
            "> `/staff-flags check` — review flagged alerts",
          ].join("\n\n")
        ),
    ];

    /* ───────── NAVIGATION ───────── */
    let page = 0;

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("staff_prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("staff_next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1),
      );

    const applyFooter = () =>
      pages[page].setFooter({
        text: `Ryvex • Staff Dashboard • Page ${page + 1}/${pages.length}`,
      }).setTimestamp();

    applyFooter();

    const message = await interaction.editReply({
      embeds: [pages[page]],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ This menu isn't for you.", ephemeral: true });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "staff_prev" && page > 0) page--;
      if (i.customId === "staff_next" && page < pages.length - 1) page++;

      applyFooter();
      await interaction.editReply({
        embeds: [pages[page]],
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
