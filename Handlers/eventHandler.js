const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");

function loadEvents(client) {
  const table = new ascii().setHeading("Event", "Status");

  const eventsPath = path.join(__dirname, "../Events");
  const eventFolders = fs.readdirSync(eventsPath);

  for (const folder of eventFolders) {
    const folderPath = path.join(eventsPath, folder);
    const eventFiles = fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(folderPath, file);
      const event = require(filePath);

      // Validation
      if (!event.name || typeof event.execute !== "function") {
        table.addRow(file, "❌ Invalid");
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

      table.addRow(event.name, "✅ Loaded");
    }
  }

  console.log(table.toString());
  console.log("Events loaded.");
}

module.exports = { loadEvents };
