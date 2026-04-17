const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const UserLevel = require("../../Database/models/UserLevel");
const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the server's XP leaderboard.")
    .addIntegerOption(opt =>
      opt
        .setName("page")
        .setDescription("Page number (default: 1)")
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const { guild } = interaction;
      const page = interaction.options.getInteger("page") || 1;
      const perPage = 5;

      const total = await UserLevel.countDocuments({ guildId: guild.id });

      if (total === 0) {
        return respond(interaction, {
          content: "📭 No one has earned XP in this server yet.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const maxPage = Math.ceil(total / perPage);
      const safePage = Math.min(page, maxPage);

      const entries = await UserLevel.find({ guildId: guild.id })
        .sort({ level: -1, xp: -1 })
        .skip((safePage - 1) * perPage)
        .limit(perPage);

      const medals = ["🥇", "🥈", "🥉"];
      const startRank = (safePage - 1) * perPage;

      const lines = entries.map((entry, i) => {
        const rank = startRank + i + 1;
        const prefix = medals[rank - 1] || `\`#${rank}\``;
        return `${prefix} <@${entry.userId}> — Level **${entry.level}** • ${entry.xp.toLocaleString()} XP`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`🏆 ${guild.name} Leaderboard`)
        .setColor("White")
        .setDescription(lines.join("\n"))
        .setFooter({
          text: `Page ${safePage}/${maxPage} • ${total} members ranked • Ryvex`,
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
      });
    } catch (error) {
      console.error("Leaderboard command failed:", error);
      return respond(interaction, {
        content: "❌ Something went wrong while fetching the leaderboard.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
