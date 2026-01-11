const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Show how long the bot has been online."),

  async execute(interaction) {
    try {
      const client = interaction.client;
      const uptime = client.uptime;

      const days = Math.floor(uptime / 86400000);
      const hours = Math.floor(uptime / 3600000) % 24;
      const minutes = Math.floor(uptime / 60000) % 60;
      const seconds = Math.floor(uptime / 1000) % 60;

      const embed = new EmbedBuilder()
        .setTitle(`⏱️ ${client.user.username} Uptime`)
        .addFields({
          name: "Uptime",
          value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
          inline: true,
        })
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Uptime command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch uptime.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
