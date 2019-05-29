const Command = require("./Command.js");

/**
 * Class for remove song from queue command.
 * @extends Command
 * @Category Commands
 */
class RemoveCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super("remove");
    super.help = "removes a song from the current queue.";
    super.usage = "<prefix>remove <queue number>";
    super.alias = ["remove"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
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
