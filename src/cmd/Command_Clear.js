const Command = require("./Command.js");

/**
 * Class for clear queue command.
 * @extends Command
 * @Category Commands
 */
class ClearCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["clear"],
      "delete all songs from current queue.",
      "<prefix>clear"
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
    this.queueService.clearQueue();
    this.chatService.simpleNote(msg, "Queue is now empty!", this.chatService.msgType.MUSIC);
  }
}

module.exports = ClearCommand;
