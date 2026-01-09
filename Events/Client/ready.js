const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    console.log(`${client.user.username} is now online.`);

    // ✅ Register slash commands HERE
    try {
      await client.application.commands.set(client._slashCommands);
      console.log("Slash commands registered.");
    } catch (err) {
      console.error("Failed to register slash commands:", err);
    }

    const activities = [
      { name: `@${client.user.username}`, type: ActivityType.Listening },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
    ];

    setInterval(() => {
      const activity =
        activities[Math.floor(Math.random() * activities.length)];

      client.user.setPresence({
        activities: [activity],
        status: "online",
      });
    }, 60_000);
  },
};
