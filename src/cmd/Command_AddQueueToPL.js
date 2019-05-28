const Command = require("./Command.js");

/**
 * Class for add to playlist command.
 * @extends Command
 */
class AddQueueToPLCommand extends Command {
  constructor(chatService, queueService, dbService) {
    super("addqueuetopl");
    super.help = "adds queue to given playlist";
    super.usage = "<prefix>addqueuetopl <playlist>";
    super.alias = ["addqueuetopl", "aq2pl", "aq2p"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
    }
    // Get queue
    const {queue} = this.queueService;
    let count = 0;
    queue.forEach((entry) => {
      count++;
      this.dbService.addSong(entry, payload).then(() => {
        console.log(`added ${entry.title} to Playlist ${payload}`);
      });
    });
    this.chatService.simpleNote(msg, `added ${count} Songs to ${payload}`, this.chatService.msgType.INFO);
  }
}
module.exports = AddQueueToPLCommand;
