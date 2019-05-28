const Command = require("./Command.js");

/**
 * Class for clear queue command.
 * @extends Command
 */
class ClearCommand extends Command {
  constructor(chatService, queueService) {
    super("clear");
    super.help = "delete all songs from current queue.";
    super.usage = "<prefix>clear";
    super.alias = ["clear"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    this.queueService.clearQueue();
    this.chatService.simpleNote(msg, "Queue is now empty!", this.chatService.msgType.MUSIC);
  }
}

module.exports = ClearCommand;
