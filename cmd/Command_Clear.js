const Command = require("./Command.js");

class ClearCommand extends Command {
  constructor(chatService, queueService) {
    super("clear");
    super.help = "delete all songs from current queue.";
    super.usage = "<prefix>clear";
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    this.queueService.clearQueue();
    this.chatService.simpleNote(msg.channel, "Queue is now empty!", this.chatService.msgType.MUSIC);
  }
}

module.exports = ClearCommand;
