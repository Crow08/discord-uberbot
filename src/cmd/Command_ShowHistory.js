const Command = require("./Command.js");

class ShowHistoryCommand extends Command {
  constructor(chatService, queueService) {
    super("showhistory");
    super.help = "displays all songs from current history.";
    super.usage = "<prefix>showhistory";
    super.alias = ["showhistory", "h", "history"];
    this.chatService = chatService;
    this.queueService = queueService;
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
      this.chatService.pagedContent(msg, pages);
    }
  }
}

module.exports = ShowHistoryCommand;
