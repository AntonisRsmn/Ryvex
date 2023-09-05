const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require("discord.js");

const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel} = Partials;

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates],
    partials: [User, Message, GuildMember, ThreadMember, Channel],
});

module.exports = client

const { DisTube } = require('distube');
const { SpotifyPlugin } = require("@distube/spotify");

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: true,
    emitAddSongWhenCreatingQueue: false,
    plugins: [new SpotifyPlugin()]
});

client.commands = new Collection();
client.config = require("./config.json");

client.on("messageCreate", (message) => {
    const embed = new EmbedBuilder()
        .setTitle('Slash Command: `/help`')
        .setColor(0xFFFFFE)
  
    if (message.author.bot) return;

    if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return;

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
        message.channel.send({embeds: [embed],});
    }
});

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});