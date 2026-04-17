const fs = require("fs");
const path = require("path");

/* ───────── ANSI COLORS ───────── */
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  yellow: "\x1b[33m",
};

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "../Events");
  const eventFolders = fs.readdirSync(eventsPath);

  const loaded = [];
  const failed = [];

  for (const folder of eventFolders) {
    const folderPath = path.join(eventsPath, folder);
    const eventFiles = fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(folderPath, file);
      const event = require(filePath);

      if (!event.name || typeof event.execute !== "function") {
        failed.push(file);
        console.warn(`Event ${file} is missing name or execute().`);
        continue;
      }

      const handler = (...args) => event.execute(...args, client);

      if (event.rest) {
        if (event.once) {
          client.rest.once(event.name, handler);
        } else {
          client.rest.on(event.name, handler);
        }
      } else {
        if (event.once) {
          client.once(event.name, handler);
        } else {
          client.on(event.name, handler);
        }
      }

      loaded.push(event.name);
    }
  }

  console.log(`  ${c.cyan}📡 Events${c.reset}    ${c.green}${c.bold}${loaded.length} loaded${c.reset}${failed.length ? `  ${c.red}${failed.length} failed${c.reset}` : ""}`);

  if (failed.length) {
    for (const f of failed) {
      console.log(`    ${c.red}✗${c.reset} ${c.dim}${f}${c.reset}`);
    }
  }
}

module.exports = { loadEvents };
