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
    const embed = new this.chatService.DiscordMessageEmbed();
    embed.setDescription("⠀\n⠀\n***Anyone called for a medic?***");
    embed.setColor("RED");
    embed.setThumbnail("https://cdn.discordapp.com/avatars/543844387835215873/baeabaa2290c3b584b4f771bf86ed5ca.png");
    this.chatService.send(msg, embed);
    const pages = [];
    let helpText = "```prolog\n+----------------------------Commands--------------------------+\n";
    this.commands.forEach((command, index) => {
      const {help, name, usage, alias} = command;
      // Ignore undefined commands
      if (typeof name !== "undefined") {
        helpText += this.buildLine(`Name:   ${name}`);
        helpText += this.buildLine(`Usage:  ${usage.replace("<prefix>", this.prefix)}`);
        helpText += this.buildLine(`About:  ${help}`);
        if (alias.length > 1) {
          helpText += this.buildLine(`Alias:  ${alias.join(", ")}`);
        }
        if ((index + 1) % 5 === 0) {
          const paging = `Page ${pages.length + 1} / ${Math.ceil(this.commands.length / 5)}`;
          helpText += `+------------------------- ${paging} -------------------------+\n\`\`\``;
          pages.push(helpText);
          helpText = "```prolog\n+----------------------------Commands--------------------------+\n";
        } else {
          helpText += "+--------------------------------------------------------------+\n";
        }
      }
    });
    if (this.commands.length % 5 !== 0) {
      helpText = helpText.substr(0, helpText.length - 65);
      const paging = `Page ${pages.length + 1} / ${Math.ceil(this.commands.length / 5)}`;
      helpText += `+------------------------- ${paging} -------------------------+\n\`\`\``;
      pages.push(helpText);
    }
    this.chatService.pagedContent(msg, pages);
  }

  buildLine(text) {
    let line = "";
    let firstSubLine = true;
    const subLines = text.split("\n");
    subLines.forEach((rawSubLine) => {
      this.wordWrap(rawSubLine, 60).forEach((subLine) => {
        if (firstSubLine) {
          firstSubLine = false;
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
