const Command = require("./Command.js");

class ShowQueueCommand extends Command {
  constructor(chatService, queueService) {
    super("showqueue");
    super.help = "displays all songs from current queue.";
    super.usage = "<prefix>showqueue";
    super.alias = ["showqueue", "q", "queue"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    const pages = [];
    let queueText = "";
    this.queueService.queue.forEach((entry, index) => {
      queueText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
      if ((index + 1) % 10 === 0) {
        queueText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.queue.length / 10)}`;
        const embed = new this.chatService.DiscordRichEmbed();
        embed.setTitle("Queue");
        embed.setColor(48769);
        embed.setDescription(queueText);
        pages.push(embed);
        queueText = "";
      }
    });
    if (this.queueService.queue.length % 10 !== 0) {
      queueText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.queue.length / 10)}`;
      const embed = new this.chatService.DiscordRichEmbed();
      embed.setTitle("Queue");
      embed.setColor(48769);
      embed.setDescription(queueText);
      pages.push(embed);
    }
    this.chatService.pagedContent(msg, pages);
  }
}

module.exports = ShowQueueCommand;
