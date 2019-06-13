const Command = require("./Command.js");

/**
 * Class for shuffle queue command.
 * @extends Command
 * @Category Commands
 */
class ShuffleCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["shuffle"],
      "shuffle the current queue.",
      "<prefix>shuffle"
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
    this.queueService.shuffleQueue();
    this.chatService.simpleNote(msg, "Queue shuffled!", this.chatService.msgType.MUSIC);
  }
}

module.exports = ShuffleCommand;
