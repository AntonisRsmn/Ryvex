const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    console.log(`${client.user.username} is now online.`);

    // ✅ Register slash commands
    try {
      await client.application.commands.set(client._slashCommands);
      console.log("Slash commands registered.");
    } catch (err) {
      console.error("Failed to register slash commands:", err);
    }

    /* ───────── SEASON CHECK ───────── */
    const now = new Date();
    const month = now.getMonth(); // 0 = January
    const day = now.getDate();

    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    let seasonalActivity = null;

    // 🎆 New Year (Jan 1–5)
    if (month === 0 && day <= 5) {
      seasonalActivity = {
        name: "🎆 Happy New Year!",
        type: ActivityType.Watching,
      };
    }

    // 💘 Valentine (Feb 10–16)
    else if (month === 1 && day >= 10 && day <= 16) {
      seasonalActivity = {
        name: "💘 Happy Valentine’s Day!",
        type: ActivityType.Watching,
      };
    }
    // 🤡 April Fools (Apr 1)
    else if (month === 3 && day === 1) {
      seasonalActivity = {
        name: "🤡 April Fools' Day!",
        type: ActivityType.Watching,
      };
    }

    // 🐣 Easter (Apr 18–21)
    else if (month === 3 && day >= 18 && day <= 21) {
      seasonalActivity = {
        name: "🐣 Happy Easter!",
        type: ActivityType.Watching,
      };
    }

    // ☀️ Summer Vibes (Jul 1 – Aug 31)
    else if (month === 6 || month === 7) {
      seasonalActivity = {
        name: "☀️ Summer Vibes!",
        type: ActivityType.Watching,
      };
    }

    // 🎂 Bot Birthday (Sep 1)
    else if (month === 8 && day === 1) {
      seasonalActivity = {
        name: "🎂 It's my birthday!",
        type: ActivityType.Watching,
      };
    }

    // 🎃 Halloween (Oct 25–31)
    else if (month === 9 && day >= 25 && day <= 31) {
      seasonalActivity = {
        name: "🎃 Happy Halloween!",
        type: ActivityType.Watching,
      };
    }

    // 🎄 Christmas (Dec 20–26)
    else if (month === 11 && day >= 20 && day <= 26) {
      seasonalActivity = {
        name: "🎄 Merry Christmas!",
        type: ActivityType.Watching,
      };
    }

    // 🥂 New Year's Eve (Dec 31)
    else if (month === 11 && day === 31) {
      seasonalActivity = {
        name: "🥂 Happy New Year's Eve!",
        type: ActivityType.Watching,
      };
    }

    // 👻 Friday the 13th (any month)
    else if (dayOfWeek === 5 && day === 13) {
      seasonalActivity = {
        name: "👻 Friday the 13th!",
        type: ActivityType.Watching,
      };
    }

    /* ───────── DEFAULT (NON-SEASONAL) ───────── */
    const normalActivities = [
      {
        name: "Listening: @Ryvex",
        type: ActivityType.Listening,
      },
      {
        name: `Watching: ${client.guilds.cache.size} servers`,
        type: ActivityType.Watching,
      },
    ];

    /* ───────── ROTATION LOOP ───────── */
    setInterval(() => {
      let activity;

      if (seasonalActivity) {
        // During event → show only the seasonal activity
        activity = seasonalActivity;
      } else {
        // Normal rotation
        activity =
          normalActivities[
            Math.floor(Math.random() * normalActivities.length)
          ];
      }

      client.user.setPresence({
        activities: [activity],
        status: "online",
      });
    }, 60_000);
  },
};
