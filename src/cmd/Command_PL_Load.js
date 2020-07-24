const Command = require("./Command.js");

/**
 * Class for load saved playlist command.
 * @extends Command
 * @Category Commands
 */
class LoadPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["plload"],
      "load a playlist replacing the current queue.",
      "<prefix>plload <pl name>"
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
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "No playlist name found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.trim();
    const note = `playlist loaded: ${plName}`;
    this.queueService.loadPlaylist(plName, msg).
      then(() => this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC)).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = LoadPLCommand;
