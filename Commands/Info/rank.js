const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const UserLevel = require("../../Database/models/UserLevel");
const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your or another member's level and XP.")
    .addUserOption(opt =>
      opt
        .setName("user")
        .setDescription("User to check (defaults to yourself)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const { guild } = interaction;

      const data = await UserLevel.findOne({
        guildId: guild.id,
        userId: user.id,
      });

      const level = data?.level ?? 0;
      const xp = data?.xp ?? 0;
      const totalMessages = data?.totalMessages ?? 0;
      const needed = UserLevel.xpForLevel(level);

      // Rank position
      const rank = data
        ? (await UserLevel.countDocuments({
            guildId: guild.id,
            xp: { $gt: xp },
          })) + 1
        : "Unranked";

      // Progress bar
      const progress = Math.min(xp / needed, 1);
      const barLength = 16;
      const filled = Math.round(progress * barLength);
      const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${user.username}'s Rank`)
        .setColor("White")
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setDescription(
          [
            `**Rank:** #${rank}`,
            `**Level:** ${level}`,
            `**XP:** ${xp.toLocaleString()} / ${needed.toLocaleString()}`,
            `**Messages:** ${totalMessages.toLocaleString()}`,
            "",
            `\`${bar}\` ${Math.floor(progress * 100)}%`,
          ].join("\n")
        )
        .setFooter({ text: "Ryvex • Leveling" })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Rank command failed:", error);
      return respond(interaction, {
        content: "❌ Something went wrong while fetching rank data.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
