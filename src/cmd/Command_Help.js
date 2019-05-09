const Command = require("./Command.js");

class HelpCommand extends Command {
  constructor(chatService, commands, prefix) {
    super("help");
    super.help = "list all implemented commands";
    super.usage = "<prefix>help";
    super.alias = ["help", "?"];
    this.chatService = chatService;
    this.commands = commands;
    this.prefix = prefix;
  }

  run(payload, msg) {
    console.log("Anyone called for a medic?\n>");
    // Add some fancy stuff
    // (More syntax highlighting: https://gist.github.com/Almeeida/41a664d8d5f3a8855591c2f1e0e07b19)
    let count = 0;
    let helpText = "```prolog\n+----------------------------Commands--------------------------+\n";

    this.commands.forEach((command, index) => {
      const {help, name, usage, alias} = command;
      // Ignrore undefined commands
      if (typeof name !== "undefined") {
        ++count;
        helpText += this.buildLine(`Name:   ${name}`);
        helpText += this.buildLine(`Usage:  ${usage.replace("<prefix>", this.prefix)}`);
        helpText += this.buildLine(`About:  ${help}`);
        if (alias.length > 1) {
          helpText += this.buildLine(`Alias:  ${alias.join(", ")}`);
        }
        helpText += "+--------------------------------------------------------------+\n";
        if (count % 5 === 0) {
          helpText += "```";
          this.chatService.plainText(msg, helpText);
          if (index + 1 < this.commands.length) {
            helpText = "```prolog\n+----------------------------Commands--------------------------+\n";
          }
        }
      }
    });
    if (count % 5 !== 0) {
      helpText += "```";
      this.chatService.plainText(msg, helpText);
    }
  }

  buildLine(text) {
    let line = "";
    let firstSubline = true;
    const sublines = text.split("\n");
    sublines.forEach((rawSubLine) => {
      this.wordWrap(rawSubLine, 60).forEach((subLine) => {
        if (firstSubline) {
          firstSubline = false;
          line += `| ${subLine.padEnd(60, " ")} |\n`;
        } else {
          line += `|         ${subLine.padEnd(52, " ")} |\n`;
        }
      });
    });
    return line;
  }

  wordWrap(input, maxWidth) {
    const result = [];
    let str = input;
    while (str.length > maxWidth) {
      let found = false;
      // Break line at first whitespace of the line.
      for (let index = maxWidth - 1; index >= 0; index--) {
        if (str.charAt(index).match(/^\s$/u)) {
          result.push(str.slice(0, index));
          str = str.slice(index + 1);
          found = true;
          break;
        }
      }
      // Break line at maxWidth position, the word is too long to wrap.
      if (!found) {
        result.push(str.slice(0, maxWidth));
        str = str.slice(maxWidth);
      }
    }
    result.push(str);
    return result;
  }
}

module.exports = HelpCommand;
