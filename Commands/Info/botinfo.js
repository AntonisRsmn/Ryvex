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
const cpuUsage = util.promisify(cpuStat.usagePercent);

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

      /* ───────── DATA ───────── */
      const version = changeLog[0]?.version ?? "Unknown";
      const uptimeFormatted = formatUptime(client.uptime);
      const gatewayPing = Math.round(client.ws.ping);
      const apiPing = Date.now() - interaction.createdTimestamp;
      const cpu = await cpuUsage();
      const memUsed = formatBytes(process.memoryUsage().heapUsed);
      const memTotal = formatBytes(process.memoryUsage().heapTotal);
      const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const totalChannels = client.channels.cache.size;

      let latencyStatus = "🟢 Healthy";
      let color = "Green";
      if (apiPing >= 250) { latencyStatus = "🔴 High Latency"; color = "Red"; }
      else if (apiPing >= 150) { latencyStatus = "🟡 Moderate"; color = "Orange"; }

      const cpuBar = (() => {
        const filled = Math.round(cpu / 10);
        return "█".repeat(filled) + "░".repeat(10 - filled);
      })();

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

        /* PAGE 2 — Live Stats */
        new EmbedBuilder()
          .setTitle("📡 Live System Stats")
          .setColor(color)
          .setDescription(
            [
              "**Latency**",
              `> 🌐 Gateway: **${gatewayPing} ms**`,
              `> 📬 API: **${apiPing} ms**`,
              `> Status: ${latencyStatus}`,
              "",
              "**Uptime**",
              `> ⏱️ ${uptimeFormatted}`,
              `> Started: <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
              "",
              "**CPU**",
              `> \`${cpuBar}\` **${cpu.toFixed(1)}%**`,
              "",
              "**Memory**",
              `> Heap used: **${memUsed}** / ${memTotal}`,
              "",
              "**Reach**",
              `> Servers: **${client.guilds.cache.size}**`,
              `> Users: **${totalUsers.toLocaleString()}**`,
              `> Channels: **${totalChannels.toLocaleString()}**`,
            ].join("\n")
          ),

        /* PAGE 3 — Links & Info */
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

      const msg = await interaction.reply({
        embeds: [pages[page]],
        components: [buildRow()],
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });

      const message = msg?.resource?.message ?? msg;
      if (!message) return;

      const collector = message.createMessageComponentCollector({
        time: 120_000,
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ This menu isn't for you.", ephemeral: true });
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
