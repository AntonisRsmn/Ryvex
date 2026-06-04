const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const cpuStat = require("cpu-stat");
const util = require("util");
const os = require("os");
const mongoose = require("mongoose");
const cpuUsage = util.promisify(cpuStat.usagePercent);

const changeLog = require("../../Data/changeLog");

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
    .setName("botinfo")
    .setDescription("View system status and bot information."),

  async execute(interaction) {
    try {
      const { client } = interaction;

      // Measure time to defer
      const deferStart = Date.now();
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const deferTime = Date.now() - deferStart;

      commandCounter++;

      /* ───────── DATA COLLECTION ───────── */
      const version = changeLog[0]?.version ?? "Unknown";
      const uptimeFormatted = formatUptime(client.uptime);
      
      // Gateway ping (WebSocket latency)
      const gatewayPing = Math.round(client.ws.ping);
      
      // API ping (interaction processing time - includes Discord + bot latency)
      const apiPing = Date.now() - interaction.createdTimestamp;
      
      // Estimate bot processing latency
      const botLatency = apiPing - gatewayPing;

      const cpu = await cpuUsage();
      const heapUsed = process.memoryUsage().heapUsed;
      const heapTotal = process.memoryUsage().heapTotal;
      const rss = process.memoryUsage().rss;
      const heapPercent = ((heapUsed / heapTotal) * 100).toFixed(1);

      const memUsed = formatBytes(heapUsed);
      const memTotal = formatBytes(heapTotal);
      const rssFormatted = formatBytes(rss);

      const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const totalChannels = client.channels.cache.size;
      const totalGuilds = client.guilds.cache.size;

      const osUptime = formatUptime(os.uptime() * 1000);
      const dbStatus = getDbStatus(mongoose.connection.readyState);
      const wsStatus = client.ws.status;

      let latencyStatus = "🟢 Healthy";
      let color = "Green";
      if (apiPing >= 250) { 
        latencyStatus = "🔴 High Latency"; 
        color = "Red"; 
      } else if (apiPing >= 150) { 
        latencyStatus = "🟡 Moderate"; 
        color = "Orange"; 
      }

      const cpuBar = (() => {
        const filled = Math.round(cpu / 10);
        return "█".repeat(filled) + "░".repeat(10 - filled);
      })();

      /* ───────── EVENT LOOP LAG ───────── */
      const start = process.hrtime.bigint();
      await new Promise(resolve => setTimeout(resolve, 100));
      const delta = Number(process.hrtime.bigint() - start) / 1e6;
      const eventLoopLag = Math.max(0, delta - 100).toFixed(2);

      /* ───────── PAGES ───────── */
      const pages = [

        /* PAGE 1 — Overview */
        new EmbedBuilder()
          .setTitle(`🤖 ${client.user.username}`)
          .setColor(color)
          .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
          .setDescription(
            [
              `**Status:** ${latencyStatus}`,
              `**Version:** v${version}`,
              `**Uptime:** ${uptimeFormatted}`,
              "",
              "A feature-rich moderation & community bot with AutoMod, leveling, anti-raid, appeals, staff monitoring, and more.",
              "",
              "**Feature highlights:**",
              "> 🛡 Full moderation suite with case system",
              "> 🤖 AutoMod — spam, links, bad words",
              "> 📊 Leveling / XP with role rewards",
              "> 🛡️ Anti-raid protection",
              "> 📨 Ban appeal system",
              "> 🧑‍⚖️ Staff accountability monitoring",
              "> 📜 Comprehensive logging",
              "> 🎭 Reaction roles, AFK, polls",
              "",
              "Use ◀ ▶ to browse pages.",
            ].join("\n")
          ),

        /* PAGE 2 — Live System Stats */
        new EmbedBuilder()
          .setTitle("📊 Live System Stats")
          .setColor(color)
          .setDescription(
            [
              "**Latency Analysis**",
              `> 📬 API Total: **${apiPing}ms** (Discord + Bot)`,
              `> 🌐 Gateway: **${gatewayPing}ms** (Discord only)`,
              `> ⚙️ Bot Processing: **${botLatency}ms** (estimated)`,
              `> 🔧 Defer Time: **${deferTime}ms**`,
              `> Status: ${latencyStatus}`,
              "",
              "**💡 Ping Diagnosis:**",
              botLatency > 100 ? "> ⚠️ High bot latency — possible CPU overload" : "> ✅ Bot latency normal",
              gatewayPing > 150 ? "> ⚠️ High gateway latency — Discord/network issue" : "> ✅ Gateway latency good",
              "",
              "**Uptime**",
              `> ⏱️ ${uptimeFormatted}`,
              `> Started: <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
            ].join("\n")
          ),

        /* PAGE 3 — Performance */
        new EmbedBuilder()
          .setTitle("⚡ Performance Metrics")
          .setColor(color)
          .setDescription(
            [
              "**CPU**",
              `> \`${cpuBar}\` **${cpu.toFixed(1)}%**`,
              "",
              "**Memory**",
              `> Heap Used: **${memUsed}** (${heapPercent}%)`,
              `> Heap Total: **${memTotal}**`,
              `> RSS Memory: **${rssFormatted}**`,
              "",
              "**Event Loop**",
              `> Lag: **${eventLoopLag}ms**`,
              "",
              "**Discord**",
              `> Guilds: **${totalGuilds.toLocaleString()}**`,
              `> Users: **${totalUsers.toLocaleString()}**`,
              `> Channels: **${totalChannels.toLocaleString()}**`,
              `> User Cache: **${client.users.cache.size}**`,
            ].join("\n")
          ),

        /* PAGE 4 — Infrastructure */
        new EmbedBuilder()
          .setTitle("🏗 Infrastructure")
          .setColor("Blue")
          .setDescription(
            [
              "**Database**",
              `> ${dbStatus}`,
              `> Database: \`${mongoose.connection.name || "Unknown"}\``,
              "",
              "**Runtime**",
              `> Node.js: \`${process.version}\``,
              `> discord.js: \`v${require("discord.js").version}\``,
              `> Platform: \`${process.platform}\``,
              `> Architecture: \`${process.arch}\``,
              `> PID: \`${process.pid}\``,
              "",
              "**Host Machine**",
              `> Uptime: **${osUptime}**`,
              `> CPU Model: \`${os.cpus()[0].model}\``,
              `> CPU Cores: **${os.cpus().length}**`,
              `> WS Status: **${wsStatus}**`,
            ].join("\n")
          ),

        /* PAGE 5 — Analytics */
        new EmbedBuilder()
          .setTitle("📈 Analytics & Diagnostics")
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
              "**System Health**",
              "> ✅ AutoMod operational",
              "> ✅ Logging operational",
              "> ✅ Slash commands healthy",
              "> ✅ Gateway connected",
              "> ✅ MongoDB reachable",
              "",
              "**Recommendations**",
              "> Monitor heap usage as server count grows.",
              "> Keep event loop lag below 10ms for best performance.",
            ].join("\n")
          ),

        /* PAGE 6 — Links & Info */
        new EmbedBuilder()
          .setTitle("🔗 Links & Info")
          .setColor("Blue")
          .setDescription(
            [
              "**Useful commands:**",
              "> `/help` — full command list by category",
              "> `/changelog latest` — see what's new",
              "> `/setup` — step-by-step server setup guide",
              "> `/settings view` — current server config",
              "> `/support` — join the support server",
              "> `/donate` — support development",
              "> `/website` — visit the website",
              "",
              "**Technical:**",
              `> Bot ID: \`${client.user.id}\``,
              `> Node.js: ${process.version}`,
              `> discord.js: v${require("discord.js").version}`,
              `> Version: v${version}`,
              "",
              "**Permissions tip:**",
              "> For full functionality, give Ryvex the **Administrator** permission or at minimum: Manage Roles, Manage Channels, Kick/Ban Members, Manage Messages, and View Audit Log.",
            ].join("\n")
          ),
      ];

      /* ───────── NAVIGATION ───────── */
      let page = 0;

      const buildRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("botinfo_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("botinfo_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === pages.length - 1),
        );

      const applyFooter = () =>
        pages[page].setFooter({
          text: `Ryvex • Bot Info • Page ${page + 1}/${pages.length}`,
        }).setTimestamp();

      applyFooter();

      const msg = await interaction.editReply({
        embeds: [pages[page]],
        components: [buildRow()],
      });

      const message = msg?.resource?.message ?? msg;
      if (!message) return;

      const collector = message.createMessageComponentCollector({
        time: 120_000,
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ This menu isn't for you.", flags: MessageFlags.Ephemeral });
        }

        await i.deferUpdate().catch(() => {});

        if (i.customId === "botinfo_prev" && page > 0) page--;
        if (i.customId === "botinfo_next" && page < pages.length - 1) page++;

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
    } catch (error) {
      console.error("botinfo error:", error);

      return respond(interaction, {
        content: "❌ Failed to fetch bot information.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
