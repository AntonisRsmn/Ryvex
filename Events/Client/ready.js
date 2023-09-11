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
            client.user.setPresence({
                activities: [{ name : `@${client.user.username} | Servers: ${client.guilds.cache.size}`, type: ActivityType.Listening }]
              })
        }, 1000 * 10);
        
    },
};