const Command = require("./Command.js");

class RemoveCommand extends Command {
  constructor(chatService, queueService, searchService) {
    super("remove");
    super.help = "removes a song from the current queue.";
    super.usage = "<prefix>remove <queue number>";
    super.alias = ["remove"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || !isNaN(payload)) {
      this.chatService.simpleNote(msg.channel, "No queue Number found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

  }
}

module.exports = RemoveCommand;
