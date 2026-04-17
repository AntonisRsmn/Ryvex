const fs = require("fs");

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

function loadCommands(client) {
  const commandsArray = [];
  const categories = {};
  let failedCount = 0;

  const commandsFolder = fs.readdirSync("./Commands");
  for (const folder of commandsFolder) {
    const commandFiles = fs
      .readdirSync(`./Commands/${folder}`)
      .filter(file => file.endsWith(".js"));

    let catLoaded = 0;
    let catFailed = 0;

    for (const file of commandFiles) {
      const commandFile = require(`../Commands/${folder}/${file}`);

      if (!commandFile.data || !commandFile.execute) {
        catFailed++;
        failedCount++;
        continue;
      }

      client.commands.set(commandFile.data.name, {
        folder,
        ...commandFile,
      });

      commandsArray.push(commandFile.data.toJSON());
      catLoaded++;
    }

    categories[folder] = { loaded: catLoaded, failed: catFailed };
  }

  const totalLoaded = commandsArray.length;

  console.log(`  ${c.cyan}⚡ Commands${c.reset}   ${c.green}${c.bold}${totalLoaded} loaded${c.reset}${failedCount ? `  ${c.red}${failedCount} failed${c.reset}` : ""}`);

  for (const [cat, info] of Object.entries(categories)) {
    const icon = info.failed ? `${c.yellow}!${c.reset}` : `${c.green}✓${c.reset}`;
    console.log(`    ${icon} ${c.dim}${cat}${c.reset} ${c.dim}(${info.loaded})${c.reset}`);
  }

  // ⛔ DO NOT REGISTER HERE
  client._slashCommands = commandsArray;
}

module.exports = { loadCommands };
