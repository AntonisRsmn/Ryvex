const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    // ✅ Register slash commands
    try {
      await client.application.commands.set(client._slashCommands);
    } catch (err) {
      console.error("Failed to register slash commands:", err);
    }

    /* ───────── EASTER CALCULATOR (Anonymous Gregorian) ───────── */
    function getEasterDate(year) {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const eMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
      const eDay = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, eMonth, eDay);
    }

    /* ───────── SEASON CHECK ───────── */
    const now = new Date();
    const month = now.getMonth(); // 0 = January
    const day = now.getDate();
    const year = now.getFullYear();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    // Easter window: Good Friday (−2) through Easter Monday (+1)
    const easter = getEasterDate(year);
    const easterStart = new Date(year, easter.getMonth(), easter.getDate() - 2);
    const easterEnd = new Date(year, easter.getMonth(), easter.getDate() + 1, 23, 59, 59);

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
        name: "💘 Happy Valentine's Day!",
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

    // 🐣 Easter (Good Friday → Easter Monday, auto-calculated yearly)
    else if (now >= easterStart && now <= easterEnd) {
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
