const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
} = require("discord.js");

const mongoose = require("mongoose");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // REQUIRED for join/leave
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.ThreadMember,
    Partials.Channel,
    Partials.Reaction,
  ],
});

// Collections
client.commands = new Collection();

// Mention handler
client.on("messageCreate", (message) => {
  if (message.author.bot || !message.guild) return;

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  ) return;

  if (
    message.content.match(new RegExp(`^<@!?${client.user.id}>(\\s|$)`))
  ) {
    const embed = new EmbedBuilder()
      .setColor("White")
      .setDescription(
        "👀 **Need assistance?**\n🤖 Use `/help` or join our [Support Server](https://discord.gg/JDDSbxKDne)"
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] }).catch(() => {});
  }
});

// 🚨 IMPORTANT ORDER 🚨
(async () => {
  try {
    // 1️⃣ Load handlers FIRST
    loadEvents(client);
    loadCommands(client);

    // 2️⃣ Connect MongoDB
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected.");

    // 3️⃣ Login LAST
    await client.login(config.token);
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
})();


module.exports = client;
