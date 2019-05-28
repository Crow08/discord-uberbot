const Command = require("./Command.js");

const validate = (resp, list) => {
  const message = resp.content.trim();
  for (let count = 0, len = list.length; count < len; count++) {
    if (list[count].command === message) {
      console.log("true");
      return true;
    }
  }
  return false;
};

const execute = (resp, list, msg) => {
  const response = resp.array()[0];
  const message = response.content.trim();
  console.log("message:");
  console.log(message);
  for (let count = 0, len = list.length; count < len; count++) {
    console.log(`started for: ${count}`);
    if (list[count].command === message) {
      console.log("command found:");
      console.log(list[count].command);
      list[count].function("heart afire", msg);
    }
  }
};

class ShowHistoryCommand extends Command {
  constructor(chatService, queueService, commands) {
    super("showhistory");
    super.help = "displays all songs from current history.";
    super.usage = "<prefix>showhistory";
    super.alias = ["showhistory", "h", "history"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.commands = commands;
  }

  run(payload, msg) {
    const pages = [];
    console.log(this.commands);
    let historyText = "";
    this.queueService.history.forEach((entry, index) => {
      historyText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
      if ((index + 1) % 10 === 0) {
        historyText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.history.length / 10)}`;
        const embed = new this.chatService.DiscordMessageEmbed();
        embed.setTitle("History");
        embed.setColor(48769);
        embed.setDescription(historyText);
        pages.push(embed);
        historyText = "";
      }
    });
    if (this.queueService.history.length % 10 !== 0) {
      historyText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.history.length / 10)}`;
      const embed = new this.chatService.DiscordMessageEmbed();
      embed.setTitle("History");
      embed.setColor(48769);
      embed.setDescription(historyText);
      pages.push(embed);
    }
    if (pages.length === 0) {
      this.chatService.simpleNote(msg, "History is empty!", this.chatService.msgType.INFO);
    } else {
      const list = [
        {"command": "p", "function": this.playSong},
        {"command": "pn", "function": this.playNext}
      ];
      this.chatService.pagedContent(msg, pages);
      this.chatService.validateInput(((responseMsg) => validate(responseMsg, list)), execute, msg, list);
    }
  }

  playSong(payload, msg) {
    console.log(payload);
    console.log(this.commands);
    this.commands.play.run(payload, msg);
  }
}

module.exports = ShowHistoryCommand;
