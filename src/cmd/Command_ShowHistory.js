const Command = require("./Command.js");

const validate = (resp, list) => {
  const message = resp.content.trim();
  for (let count = 0, len = list.length; count < len; count++) {
    if (list[count].command === message) {
      console.log("geht das? reicht es, wenn die Funktion übergeben wird?");
      return true;
    }
  }
  return false;
};

const execute = (resp, list) => {
  const message = resp.content.trim();
  for (let count = 0, len = list.length; count < len; count++) {
    if (list[count].command === message) {
      list.function();
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
      this.chatService.validateInput(((responseMsg) => validate(responseMsg, list)), msg);
    }
  }

  playSong(payload, msg) {
    this.commands.play.run(payload, msg);
  }
}

module.exports = ShowHistoryCommand;
