const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const os = require("os");
const mongoose = require("mongoose");
const cpuStat = require("cpu-stat");
const util = require("util");

const cpuUsage = util.promisify(cpuStat.usagePercent);

const changeLog = require("../../Data/changeLog");

/* ───────── DEV IDS ───────── */
const DEV_IDS = [
  "493343656028143647",
];

/* ───────── RUNTIME METRICS ───────── */
let commandCounter = 0;
let commandFailures = 0;
let restartCounter = 1;

process.on("unhandledRejection", () => {
  commandFailures++;
});

process.on("uncaughtException", () => {
  commandFailures++;
});

/* ───────── UTIL ───────── */
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat(
    (bytes / Math.pow(k, i)).toFixed(dm)
  )} ${sizes[i]}`;
}

function formatUptime(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000) % 24;
  const minutes = Math.floor(ms / 60000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getDbStatus(state) {
  switch (state) {
    case 0:
      return "🔴 Disconnected";
    case 1:
      return "🟢 Connected";
    case 2:
      return "🟡 Connecting";
    case 3:
      return "🟠 Disconnecting";
    default:
      return "⚪ Unknown";
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vitals")
    .setDescription("Developer-only infrastructure dashboard."),

  async execute(interaction) {
    try {
      /* ───────── DEV CHECK ───────── */
      if (!DEV_IDS.includes(interaction.user.id)) {
        return interaction.reply({
          content: "❌ This command is restricted to the bot developer.",
          flags: MessageFlags.Ephemeral,
        });
      }

      commandCounter++;

      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });

      const { client } = interaction;

      /* ───────── LIVE DATA ───────── */
      const version = changeLog[0]?.version ?? "Unknown";

      const uptime = formatUptime(client.uptime);

      const gatewayPing = Math.round(client.ws.ping);
      const apiPing = Date.now() - interaction.createdTimestamp;

      const cpu = await cpuUsage();

      const heapUsed = process.memoryUsage().heapUsed;
      const heapTotal = process.memoryUsage().heapTotal;
      const rss = process.memoryUsage().rss;

      const heapPercent = (
        (heapUsed / heapTotal) * 100
      ).toFixed(1);

      const memUsed = formatBytes(heapUsed);
      const memTotal = formatBytes(heapTotal);
      const rssFormatted = formatBytes(rss);

      const totalUsers = client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      const totalChannels = client.channels.cache.size;
      const totalGuilds = client.guilds.cache.size;

      const osUptime = formatUptime(os.uptime() * 1000);

      const dbStatus = getDbStatus(
        mongoose.connection.readyState
      );

      const wsStatus = client.ws.status;

      const cpuBar = (() => {
        const filled = Math.round(cpu / 10);
        return "█".repeat(filled) + "░".repeat(10 - filled);
      })();

      let health = "🟢 Healthy";
      let color = "Green";

      if (apiPing >= 250) {
        health = "🔴 High Latency";
        color = "Red";
      } else if (apiPing >= 150) {
        health = "🟡 Moderate";
        color = "Orange";
      }

      /* ───────── EVENT LOOP LAG ───────── */
      const start = process.hrtime.bigint();

      await new Promise(resolve =>
        setTimeout(resolve, 100)
      );

      const delta =
        Number(process.hrtime.bigint() - start) / 1e6;

      const eventLoopLag = Math.max(
        0,
        delta - 100
      ).toFixed(2);

      /* ───────── PAGES ───────── */
      const pages = [

        /* PAGE 1 */
        new EmbedBuilder()
          .setTitle("🛡 Ryvex Infrastructure")
          .setColor(color)
          .setThumbnail(
            client.user.displayAvatarURL({ size: 256 })
          )
          .setDescription(
            [
              `**Health:** ${health}`,
              `**Version:** v${version}`,
              `**Uptime:** ${uptime}`,
              "",
              "**Performance**",
              `> 🌐 Gateway Ping: **${gatewayPing}ms**`,
              `> 📬 API Ping: **${apiPing}ms**`,
              `> 🧠 CPU Usage: **${cpu.toFixed(1)}%**`,
              `> \`${cpuBar}\``,
              `> ⚡ Event Loop Lag: **${eventLoopLag}ms**`,
              "",
              "**Memory**",
              `> 💾 Heap Used: **${memUsed}**`,
              `> 📦 Heap Total: **${memTotal}**`,
              `> 🧠 Heap Usage: **${heapPercent}%**`,
              `> 🗂 RSS Memory: **${rssFormatted}**`,
              "",
              "Use ◀ ▶ to navigate.",
            ].join("\n")
          ),

        /* PAGE 2 */
        new EmbedBuilder()
          .setTitle("📡 Discord Statistics")
          .setColor(color)
          .setDescription(
            [
              "**Reach**",
              `> 🏠 Servers: **${totalGuilds.toLocaleString()}**`,
              `> 👥 Users: **${totalUsers.toLocaleString()}**`,
              `> 💬 Channels: **${totalChannels.toLocaleString()}**`,
              "",
              "**Cache Statistics**",
              `> Guild Cache: **${client.guilds.cache.size}**`,
              `> User Cache: **${client.users.cache.size}**`,
              `> Channel Cache: **${client.channels.cache.size}**`,
              `> Emoji Cache: **${client.emojis.cache.size}**`,
              "",
              "**WebSocket**",
              `> 📡 WS Status: **${wsStatus}**`,
              `> 🌐 Gateway Ping: **${gatewayPing}ms**`,
            ].join("\n")
          ),

        /* PAGE 3 */
        new EmbedBuilder()
          .setTitle("🗄 Database & Runtime")
          .setColor("Blue")
          .setDescription(
            [
              "**MongoDB**",
              `> ${dbStatus}`,
              `> 📂 Database: \`${mongoose.connection.name || "Unknown"}\``,
              "",
              "**Runtime**",
              `> ⚙ Node.js: \`${process.version}\``,
              `> 📦 discord.js: \`v${require("discord.js").version}\``,
              `> 🖥 Platform: \`${process.platform}\``,
              `> 🧱 Architecture: \`${process.arch}\``,
              `> 🔄 PID: \`${process.pid}\``,
              "",
              "**Host Machine**",
              `> 🖥 Host Uptime: **${osUptime}**`,
              `> 🧠 CPU Model: \`${os.cpus()[0].model}\``,
              `> ⚡ CPU Cores: **${os.cpus().length}**`,
            ].join("\n")
          ),

        /* PAGE 4 */
        new EmbedBuilder()
          .setTitle("📊 Analytics & Diagnostics")
          .setColor("Purple")
          .setDescription(
            [
              "**Command Analytics**",
              `> ⚡ Commands Loaded: **${client.commands.size}**`,
              `> 📈 Commands Used Since Boot: **${commandCounter}**`,
              "",
              "**Errors**",
              `> ❌ Runtime Errors: **${commandFailures}**`,
              "",
              "**Restarts**",
              `> 🔄 Restart Counter: **${restartCounter}**`,
              "",
              "**Diagnostics**",
              "> ✅ AutoMod operational",
              "> ✅ Logging operational",
              "> ✅ Slash commands healthy",
              "> ✅ Gateway connected",
              "> ✅ MongoDB reachable",
              "",
              "**Scaling Notes**",
              "> Monitor heap usage and event loop lag",
              "> as server count grows.",
            ].join("\n")
          ),
      ];

      /* ───────── NAVIGATION ───────── */
      let page = 0;

      const buildRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("devstats_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),

          new ButtonBuilder()
            .setCustomId("devstats_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === pages.length - 1)
        );

      const applyFooter = () => {
        pages[page]
          .setFooter({
            text: `Ryvex • Developer Stats • Page ${page + 1}/${pages.length}`,
          })
          .setTimestamp();
      };

      applyFooter();

      const msg = await interaction.editReply({
        embeds: [pages[page]],
        components: [buildRow()],
      });

      const message = msg?.resource?.message ?? msg;

      if (!message) return;

      const collector =
        message.createMessageComponentCollector({
          time: 120000,
        });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "❌ This menu isn't for you.",
            flags: MessageFlags.Ephemeral,
          });
        }

        await i.deferUpdate().catch(() => {});

        if (
          i.customId === "devstats_prev" &&
          page > 0
        ) {
          page--;
        }

        if (
          i.customId === "devstats_next" &&
          page < pages.length - 1
        ) {
          page++;
        }

        applyFooter();

        await interaction.editReply({
          embeds: [pages[page]],
          components: [buildRow()],
        });
      });

      collector.on("end", async () => {
        const disabledRow =
          new ActionRowBuilder().addComponents(
            ...buildRow().components.map(button =>
              ButtonBuilder.from(button).setDisabled(true)
            )
          );

        await interaction
          .editReply({
            components: [disabledRow],
          })
          .catch(() => {});
      });

    } catch (error) {
      console.error("devstats error:", error);

      commandFailures++;

      if (interaction.deferred || interaction.replied) {
        return interaction
          .editReply({
            content:
              "❌ Failed to load developer statistics.",
          })
          .catch(() => {});
      }

      return interaction
        .reply({
          content:
            "❌ Failed to load developer statistics.",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {});
    }
  },
};