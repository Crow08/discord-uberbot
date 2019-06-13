const Command = require("./Command.js");

/**
 * Class for loop queue command.
 * @extends Command
 * @Category Commands
 */
class LoopCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["loop"],
      "toggle loop mode of the queue.\nadd 1 to loop only the current song.",
      "<prefix>loop [1]"
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
    if (payload === "1") {
      this.queueService.mode = "ro";
      this.chatService.simpleNote(msg, "Loop current song!", this.chatService.msgType.MUSIC);
    } else if (this.queueService.mode === "n") {
      this.queueService.mode = "ra";
      this.chatService.simpleNote(msg, "Loop current queue!", this.chatService.msgType.MUSIC);
    } else {
      this.queueService.mode = "n";
      this.chatService.simpleNote(msg, "No more looping!", this.chatService.msgType.MUSIC);
    }
  }
}

module.exports = LoopCommand;
