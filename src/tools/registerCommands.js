const {
  SlashCommandBuilder,
  REST
} = require("discord.js");
const {Routes} = require("discord-api-types/v10");
const path = require("node:path");
const fs = require("node:fs");
const settings = require("../../settings.json");

let clientId = settings.clientId;
let token = settings.token;

const rest = new REST({"version": "10"}).setToken(token);

const cmdPath = path.join(__dirname, "..\\cmd");
const cmdFiles = fs.readdirSync(cmdPath).filter((file) => file.startsWith("Command_"));

const commands = [];

for (const cmdFile of cmdFiles) {
  const cmd = require(path.join(cmdPath, cmdFile));
  if (cmd.scope === "G" ||
    (cmd.scope === "A" && !settings.disableAnnouncer) ||
    (cmd.scope === "M" && !settings.disableBot)) {
    commands.push(cmd.data.toJSON());
  }
}

rest.put(Routes.applicationCommands(clientId), {"body": commands}).
  then((data) => console.log(`Successfully registered ${data.length} application commands.`)).
  catch(console.error);
