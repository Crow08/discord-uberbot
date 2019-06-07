const Command = require("./Command.js");

/**
 * Class for add the current queue to a playlist command.
 * @extends Command
 * @Category Commands
 */
class AddQueueToPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {DbService} dbService - dbService.
   */
  constructor(chatService, queueService, dbService) {
    super("addqueuetopl");
    super.help = "adds queue to given playlist";
    super.usage = "<prefix>addqueuetopl <playlist>";
    super.alias = ["addqueuetopl", "aq2pl", "aq2p"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
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
