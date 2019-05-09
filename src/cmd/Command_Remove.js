const Command = require("./Command.js");

class RemoveCommand extends Command {
  constructor(chatService, queueService) {
    super("remove");
    super.help = "removes a song from the current queue.";
    super.usage = "<prefix>remove <queue number>";
    super.alias = ["remove"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || isNaN(payload)) {
      this.chatService.simpleNote(msg, "No queue number found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const index = payload - 1;
    if (index < 0 || index >= this.queueService.queue.length) {
      this.chatService.simpleNote(msg, "queue number out of bounds!", this.chatService.msgType.FAIL);
      return;
    }

    this.queueService.remove(index);
    this.chatService.simpleNote(msg, "song removed from the queue!", this.chatService.msgType.MUSIC);
  }
}

module.exports = RemoveCommand;
