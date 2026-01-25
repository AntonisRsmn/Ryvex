const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
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

    const actions = await ModAction.find(query).lean();

    if (!actions.length) {
      const embed = new EmbedBuilder()
        .setTitle("📊 Staff Dashboard")
        .setColor("Red")
        .setDescription("❌ No moderation activity found for this period.")
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const staffMap = new Map();

    for (const a of actions) {
      if (!staffMap.has(a.moderatorId)) {
        staffMap.set(a.moderatorId, {
          tag: a.moderatorTag,
          total: 0,
        });
      }
      staffMap.get(a.moderatorId).total++;
    }

    const mostActive = [...staffMap.values()].sort(
      (a, b) => b.total - a.total
    )[0];

    const alertsCount =
      settings.staffMonitoring?.alerts?.length ?? 0;

    const embed = new EmbedBuilder()
      .setTitle("🧑‍⚖️ Staff Accountability Dashboard")
      .setColor("Blue")
      .setDescription(`📅 **Range:** ${rangeLabel}`)
      .addFields(
        {
          name: "🚨 Monitoring",
          value: settings.staffMonitoring?.enabled
            ? "🟢 Enabled"
            : "🔴 Disabled",
          inline: true,
        },
        {
          name: "⚠️ Alerts",
          value: `${alertsCount}`,
          inline: true,
        },
        {
          name: "📈 Most Active Staff",
          value: mostActive
            ? `${mostActive.tag} — **${mostActive.total} actions**`
            : "—",
          inline: false,
        }
      )
      .setFooter({
        text: `Staff members: ${staffMap.size}`,
      })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
