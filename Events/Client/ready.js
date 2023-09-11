const { Client, ActivityType } = require("discord.js");
const mongoose = require("mongoose");
const config = require("../../config.json");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        if (mongoose.connect) {
            console.log("MongoDB Connected.")
        }

        console.log(`${client.user.username} is now online.`);

        setInterval(() => {
            const act = [
                { name: `@${client.user.username}`, type: ActivityType.Listening },
                { name: `${client.guilds.cache.size} Servers`, type: ActivityType.Watching },
            ];

            var random = act[Math.floor(Math.random() * act.length)];
            client.user.setPresence({
                activities: [random]
            })
        }, 1000 * 10);
        
    },
};