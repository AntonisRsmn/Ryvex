const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const changelogData = require("../../Utils/changelogData");
const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("View the latest Ryvex updates for your server."),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const settings = await getGuildSettings(guildId);

    const latest = changelogData[0];
    const lastSeen = settings.lastSeenChangelogVersion;

    // ───────── DETERMINE WHAT TO SHOW ─────────
    let updatesToShow = [];

    if (!lastSeen) {
      updatesToShow = [latest];
    } else {
      const lastIndex = changelogData.findIndex(
        c => c.version === lastSeen
      );

      updatesToShow =
        lastIndex === -1
          ? [latest]
          : changelogData.slice(0, lastIndex);
    }

    // ───────── NO NEW UPDATES ─────────
    if (!updatesToShow.length) {
      const embed = new EmbedBuilder()
        .setTitle("🚀 Ryvex Changelog")
        .setColor("Green")
        .setDescription(
          `You're fully up to date 🎉\n\n**Latest version:** v${latest.version}`
        )
        .setFooter({ text: "No new updates for this server" })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // ───────── BUILD CHANGELOG EMBED ─────────
    const embed = new EmbedBuilder()
      .setTitle("🚀 Ryvex Update")
      .setColor("Blue")
      .setTimestamp();

    for (const entry of updatesToShow) {
      const lines = [];

      if (entry.sections.new?.length) {
        lines.push(
          `✨ **New**\n${entry.sections.new.map(x => `• ${x}`).join("\n")}`
        );
      }

      if (entry.sections.improvements?.length) {
        lines.push(
          `🛠 **Improvements**\n${entry.sections.improvements
            .map(x => `• ${x}`)
            .join("\n")}`
        );
      }

      if (entry.sections.notes?.length) {
        lines.push(
          `📌 **Notes**\n${entry.sections.notes.map(x => `• ${x}`).join("\n")}`
        );
      }

      embed.addFields({
        name: `v${entry.version} — ${entry.date}`,
        value: lines.join("\n\n"),
      });
    }

    embed.setFooter({
      text: "Marked as read for this server",
    });

    // ───────── SAVE LAST SEEN VERSION ─────────
    await updateGuildSettings(guildId, {
      lastSeenChangelogVersion: latest.version,
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
