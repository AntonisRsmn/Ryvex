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

/* ───────── STARTUP ───────── */
(async () => {
  try {
    loadEvents(client);
    loadCommands(client);

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected.");

    await client.login(config.token);
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
})();

module.exports = client;
