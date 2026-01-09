function loadCommands(client) {
  const ascii = require("ascii-table");
  const fs = require("fs");
  const table = new ascii().setHeading("Commands", "Status");

  const commandsArray = [];

  const commandsFolder = fs.readdirSync("./Commands");
  for (const folder of commandsFolder) {
    const commandFiles = fs
      .readdirSync(`./Commands/${folder}`)
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const commandFile = require(`../Commands/${folder}/${file}`);

      if (!commandFile.data || !commandFile.execute) {
        table.addRow(file, "❌ Invalid");
        continue;
      }

      client.commands.set(commandFile.data.name, {
        folder,
        ...commandFile,
      });

      commandsArray.push(commandFile.data.toJSON());
      table.addRow(file, "✅ Loaded");
    }
  }

  console.log(table.toString());
  console.log("Commands loaded.");

  // ⛔ DO NOT REGISTER HERE
  client._slashCommands = commandsArray;
}

module.exports = { loadCommands };
