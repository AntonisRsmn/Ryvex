const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Show the bot's latency and connection health."),

  async execute(interaction) {
    try {
      // Gateway (WebSocket) latency
      const gatewayPing = Math.round(interaction.client.ws.ping);

      // API round-trip latency
      const apiPing = Date.now() - interaction.createdTimestamp;

      // Status indicator
      let status = "🟢 Healthy";
      let color = "Green";

      if (apiPing >= 250) {
        status = "🔴 High Latency";
        color = "Red";
      } else if (apiPing >= 150) {
        status = "🟡 Moderate";
        color = "Orange";
      }

      const embed = new EmbedBuilder()
        .setTitle("🏓 Pong!")
        .setColor(color)
        .setDescription(
          [
            `**Status:** ${status}`,
            "",
            `🌐 **Gateway Latency:** ${gatewayPing} ms`,
            `📡 **API Latency:** ${apiPing} ms`,
            "",
            "ℹ️ *Gateway = Discord WebSocket*",
            "ℹ️ *API = Discord response time*",
          ].join("\n")
        )
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
      console.error("Ping command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch latency.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
