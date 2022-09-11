const {
  SlashCommandBuilder,
  REST
} = require("discord.js");
const {Routes} = require("discord-api-types/v10");
const path = require("node:path");
const fs = require("node:fs");

let clientId = "";
let token = "";

const rest = new REST({"version": "10"}).setToken(token);

const cmdPath = path.join(__dirname, "..\\cmd");
const cmdFiles = fs.readdirSync(cmdPath).filter((file) => file.startsWith("Command_"));

const commands = [];

for (const cmdFile of cmdFiles) {
  const cmd = require(path.join(cmdPath, cmdFile));
  commands.push(cmd.data.toJSON());
}

/*const id = "1017958370696765510";
rest.delete(Routes.applicationCommand(clientId, id)).
  then(() => console.log("Successfully deleted application command")).
  catch(console.error);*/

rest.put(Routes.applicationCommands(clientId), {"body": commands}).
  then((data) => console.log(`Successfully registered ${data.length} application commands.`)).
  catch(console.error);
