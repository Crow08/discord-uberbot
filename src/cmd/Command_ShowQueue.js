const Command = require("./Command.js");

/**
 * Class for show queue command.
 * @extends Command
 * @Category Commands
 */
class ShowQueueCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["showqueue", "q", "queue"],
      "displays all songs from current queue.",
      "<prefix>showqueue"
    );
    this.chatService = chatService;
    this.queueService = queueService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const pages = [];
    let queueText = "";
    this.queueService.queue.forEach((entry, index) => {
      queueText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
      if ((index + 1) % 10 === 0) {
        queueText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.queue.length / 10)}`;
        const embed = new this.chatService.DiscordMessageEmbed();
        embed.setTitle("Queue");
        embed.setColor(48769);
        embed.setDescription(queueText);
        pages.push(embed);
        queueText = "";
      }
    });
    if (this.queueService.queue.length % 10 !== 0) {
      queueText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.queue.length / 10)}`;
      const embed = new this.chatService.DiscordMessageEmbed();
      embed.setTitle("Queue");
      embed.setColor(48769);
      embed.setDescription(queueText);
      pages.push(embed);
    }
    if (pages.length === 0) {
      this.chatService.simpleNote(msg, "Queue is empty!", this.chatService.msgType.INFO);
    } else {
      this.chatService.pagedContent(msg, pages);
    }
  }
}

module.exports = ShowQueueCommand;
