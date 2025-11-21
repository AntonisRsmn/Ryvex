const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
} = require("discord.js");
require("events").defaultMaxListeners = 20;

const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildVoiceStates,
  MessageContent,
  GuildMessageReactions,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel, Reaction } =
  Partials;

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const pollCommand = require("./Commands/Info/poll.js");

const client = new Client({
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildVoiceStates,
    GuildMessageReactions,
  ],
  partials: [User, Message, GuildMember, ThreadMember, Channel, Reaction],
});

// set client-specific listener limit (instead of require('events').defaultMaxListeners)
client.setMaxListeners(20);

client.commands = new Collection();
client.config = require("./config.json");

client.on("messageCreate", (message) => {
  const embed = new EmbedBuilder()
    .addFields(
      { name: " ", value: "👀 Need assistance ?", inline: true },
      {
        name: " ",
        value:
          "🤖 Use </help:1084950800398303267> or join our [Support Server](https://discord.gg/JDDSbxKDne)",
        inline: true,
      }
    )
    .setColor(0xfffffe)
    .setTimestamp();

  if (message.author.bot) return;

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone") ||
    message.type == "REPLY"
  )
    return;

  if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (user.bot) return;

  // Only handle reactions on poll messages
  if (!pollCommand.pollMessages.includes(reaction.message.id)) return;

  if (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") {
    const otherEmoji = reaction.emoji.name === "✅" ? "❌" : "✅";
    const userReactions = reaction.message.reactions.cache.filter((r) =>
      r.users.cache.has(user.id)
    );
    for (const r of userReactions.values()) {
      if (r.emoji.name === otherEmoji) {
        await r.users.remove(user.id);
      }
    }
  }
});

module.exports = client;

client.login(client.config.token).then(() => {
  loadEvents(client);
  loadCommands(client);
});
