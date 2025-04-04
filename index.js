const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require("discord.js");
require('events').defaultMaxListeners = 20;

const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel} = Partials;

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates],
    partials: [User, Message, GuildMember, ThreadMember, Channel],
});

client.commands = new Collection();
client.config = require("./config.json");

client.on("messageCreate", (message) => {
    const embed = new EmbedBuilder()
        .addFields(
            { name: " ", value: "👀 Need assistance ?", inline: true },
            { name: " ", value: "🤖 Use </help:1084950800398303267> or join our [Support Server](https://discord.gg/JDDSbxKDne)", inline: true },
        )
        .setColor(0xFFFFFE)
        .setTimestamp()
  
    if (message.author.bot) return;

    if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return;

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
        message.channel.send({embeds: [embed],});
    }
});

// client.on("messageCreate", (message) => {
//     const embed = new EmbedBuilder()
//         .setTitle("Ryvex™")
//         .setDescription("Commands can only be used inside servers.")
//         .setColor("fffffe")
//         .setTimestamp()

//         if (!interaction.isChatInputCommand()) return;

//         const command = client.commands.get(interaction.commandName);

//         if (!command) {
//             interaction.reply({content: "outdated command"});
//         }

//         if (!interaction.guild)
//             return interaction.reply({ embeds: [embed], ephemeral: true })

//         command.execute(interaction, client);
// });

module.exports = client;

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});
