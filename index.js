const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

const mongoose = require("mongoose");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const config = require("./config.json");

/* ───────── GLOBAL CRASH PROTECTION ───────── */
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

/* ───────── CLIENT ───────── */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.Channel,
    Partials.Reaction,
  ],
  sweepers: {
    messages: { interval: 300, lifetime: 600 },
    users: { interval: 3600, filter: () => (user) => !user.bot },
    guildMembers: { interval: 3600, filter: () => (member) => !member.user?.bot },
    reactions: { interval: 300, filter: () => () => true },
  },
});

client.commands = new Collection();

/* ───────── BOT MENTION HANDLER ───────── */
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  // Ignore mass mentions
  if (
    message.content.includes("@everyone") ||
    message.content.includes("@here")
  ) return;

  // Only exact bot mention
  if (!message.content.match(new RegExp(`^<@!?${client.user.id}>(\\s|$)`))) {
    return;
  }

  const perms = message.member.permissions;

  const isAdmin = perms.has(PermissionFlagsBits.Administrator);

  const isModerator =
    isAdmin ||
    perms.has(PermissionFlagsBits.ModerateMembers) ||
    perms.has(PermissionFlagsBits.ManageGuild) ||
    perms.has(PermissionFlagsBits.ManageRoles) ||
    perms.has(PermissionFlagsBits.ManageChannels);

  const embed = new EmbedBuilder()
    .setColor("White")
    .setTitle("👋 Hey! I’m Ryvex")
    .setDescription(
      [
        "I help servers with **moderation, logging, and case management**.",
        "",
        "🔧 **Get started:** `/setup`",
        isModerator ? "⚙️ **Server settings:** `/settings`" : null,
        "🧾 **Latest updates:** `/changelog latest`",
        "📖 **All commands:** `/help`",
        "",
        "💬 Need help? Join the **Support Server** below 👇",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .setFooter({
      text: "Tip: Ryvex works entirely with slash commands (/)",
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🔧 Setup")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("open_setup"),

    ...(isModerator
      ? [
          new ButtonBuilder()
            .setLabel("⚙️ Settings")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("open_settings"),
        ]
      : []),

    new ButtonBuilder()
      .setLabel("🧾 Changelog")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("open_changelog"),

    new ButtonBuilder()
      .setLabel("💬 Support")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/JDDSbxKDne")
  );

  const reply = await message.channel
    .send({
      embeds: [embed],
      components: [row],
    })
    .catch(() => null);

  if (!reply) return;

  // Auto-delete after 30s
  setTimeout(() => {
    reply.delete().catch(() => {});
  }, 30_000);
});

/* ───────── ANSI COLORS ───────── */
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  magenta: "\x1b[35m",
};

const version = require("./package.json").version;

/* ───────── STARTUP ───────── */
(async () => {
  try {
    console.log();
    console.log(`${c.cyan}${c.bold}  ╔══════════════════════╗${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ║      R Y V E X       ║${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ╚══════════════════════╝${c.reset}`);
    console.log();

    loadEvents(client);
    loadCommands(client);

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`  ${c.green}🗄  Database${c.reset}   ${c.green}${c.bold}Connected${c.reset}`);

    await client.login(config.token);

    console.log(`  ${c.magenta}🤖 Bot${c.reset}        ${c.green}${c.bold}Online${c.reset} ${c.dim}as ${client.user.tag}${c.reset}`);
    console.log(`  ${c.cyan}🌐 Guilds${c.reset}      ${c.bold}${client.guilds.cache.size}${c.reset}`);
    console.log();
    console.log(`${c.dim}  ─────────────────────────────────────${c.reset}`);
    console.log(`${c.green}${c.bold}  ✓ Ready${c.reset} ${c.dim}— Ryvex is fully operational${c.reset}`);
    console.log(`${c.dim}  ─────────────────────────────────────${c.reset}`);
    console.log();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
})();

module.exports = client;
