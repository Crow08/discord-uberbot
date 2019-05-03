const Command = require("./Command.js");

class HelpCommand extends Command {
  constructor(chatService, commands) {
    super("help");
    super.help = "list all implemented commands";
    super.usage = "<prefix>help";
    super.alias = ["help", "?"];
    this.chatService = chatService;
    this.commands = commands;
  }

  run(payload, msg) {
    console.log("--------------------- Anyone called for a medic? ---------------------");
    // Add some fancy stuff
    // (More syntax highlighting: https://gist.github.com/Almeeida/41a664d8d5f3a8855591c2f1e0e07b19)
    let count = 0;
    let helpText = "```prolog\n+---------------------------Commands-------------------------+\n";

    for (const key in this.commands) {
      if (Object.prototype.hasOwnProperty.call(this.commands, key)) {
        const {help, name, usage, alias} = this.commands[key];
        // Ignrore undefined commands
        if (String(name) !== "undefined") {
          ++count;
          helpText += `${`| Name:  ${name}`.padEnd(61, " ")}|\n`;
          helpText += `${`| About: ${help}`.padEnd(61, " ")}|\n`;
          helpText += `${`| Usage: ${usage}`.padEnd(61, " ")}|\n`;
          helpText += `${`| Alias: ${alias}`.padEnd(61, " ")}|\n`;
          helpText += "+------------------------------------------------------------+\n";
          if (count % 5 === 0) {
            helpText += "```";
            this.chatService.basicNote(msg.channel, helpText);
            helpText = "```prolog\n+---------------------------Commands-------------------------+\n";
          }
        }
      }
    }
    if (count % 5 !== 0) {
      helpText += "```";
      // Dump all into discord channel
      this.chatService.basicNote(msg.channel, helpText);
    }
  }
}

module.exports = HelpCommand;
