const Command = require("./Command.js");

class ShuffleCommand extends Command {
  constructor(chatService, queueService) {
    super("shuffle");
    super.help = "shuffle the current queue.";
    super.usage = "<prefix>shuffle";
    super.alias = ["shuffle"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    this.queueService.shuffleQueue();
    this.chatService.simpleNote(msg, "Queue shuffled!", this.chatService.msgType.MUSIC);
  }
}

module.exports = ShuffleCommand;
