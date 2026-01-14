const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const cpuStat = require("cpu-stat");
const util = require("util");
const cpuUsage = util.promisify(cpuStat.usagePercent);

// 🔹 Single source of truth
const changeLog = require("../../Data/changeLog");

function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatUptime(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000) % 24;
  const minutes = Math.floor(ms / 60000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("View system status and bot information."),

  async execute(interaction) {
    try {
      const { client } = interaction;

      /* ───────── VERSION ───────── */
      const version = changeLog[0]?.version ?? "Unknown";

      /* ───────── UPTIME ───────── */
      const uptimeFormatted = formatUptime(client.uptime);

      /* ───────── PING ───────── */
      const gatewayPing = Math.round(client.ws.ping);
      const apiPing = Date.now() - interaction.createdTimestamp;

      let latencyStatus = "🟢 Healthy";
      let color = "Green";

      if (apiPing >= 250) {
        latencyStatus = "🔴 High Latency";
        color = "Red";
      } else if (apiPing >= 150) {
        latencyStatus = "🟡 Moderate";
        color = "Orange";
      }

      /* ───────── SYSTEM STATS ───────── */
      const cpu = await cpuUsage();
      const memory = formatBytes(process.memoryUsage().heapUsed);

      const embed = new EmbedBuilder()
        .setTitle(`🤖 ${client.user.username} — System Overview`)
        .setColor(color)
        .setDescription(
          [
            `**Status:** ${latencyStatus}`,
            "",
            "📡 **Latency**",
            `• 🌐 Gateway: **${gatewayPing} ms**`,
            `• 📬 API: **${apiPing} ms**`,
            "",
            "⏱️ **Uptime**",
            `• ${uptimeFormatted}`,
            "",
            "🖥️ **System**",
            `• CPU Usage: **${cpu.toFixed(2)}%**`,
            `• Memory Usage: **${memory}**`,
          ].join("\n")
        )
        .addFields(
          { name: "Version", value: `v${version}`, inline: true },
          { name: "Node.js", value: process.version, inline: true },
          { name: "Bot ID", value: client.user.id, inline: true }
        )
        .setFooter({
          text: "Use /changelog latest to see what’s new",
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("botinfo error:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch bot information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
