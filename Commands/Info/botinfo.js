const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

const cpuStat = require("cpu-stat");
const util = require("util");
const cpuUsage = util.promisify(cpuStat.usagePercent);

// 🔹 changeLog (single source of truth)
const changeLog = require("../../Data/changeLog");

function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Get information about the bot."),

  async execute(interaction) {
    try {
      const { client } = interaction;

      /* ───────── VERSION ───────── */
      const currentVersion = changeLog[0]?.version ?? "Unknown";

      /* ───────── UPTIME ───────── */
      const uptime = client.uptime;
      const days = Math.floor(uptime / 86400000);
      const hours = Math.floor(uptime / 3600000) % 24;
      const minutes = Math.floor(uptime / 60000) % 60;
      const seconds = Math.floor(uptime / 1000) % 60;

      /* ───────── STATS ───────── */
      const cpu = await cpuUsage();
      const memoryUsage = formatBytes(process.memoryUsage().heapUsed);

      const embed = new EmbedBuilder()
        .setTitle(`${client.user.username} — Bot Information`)
        .setColor("White")
        .addFields(
          { name: "Developer", value: "Rusman", inline: true },
          { name: "Version", value: `v${currentVersion}`, inline: true },
          { name: "Bot ID", value: client.user.id, inline: true },
          { name: "Node.js", value: process.version, inline: true },
          { name: "Ping", value: `${client.ws.ping} ms`, inline: true },
          { name: "CPU Usage", value: `${cpu.toFixed(2)}%`, inline: true },
          { name: "Memory Usage", value: memoryUsage, inline: true },
          {
            name: "Uptime",
            value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
            inline: true,
          }
        )
        .setFooter({
          text: "Use /changeLog latest to see what’s new",
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
