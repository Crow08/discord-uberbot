const Command = require("./Command.js");

/**
 * Class for set auto playlist command.
 * @extends Command
 * @Category Commands
 */
class AutoPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super(
      ["autopl", "apl", "auto"],
      "get or set a playlist name to be the auto playlist.\n" +
      "(playlist name to set, no parameter to get and \"unset\" to unset).",
      "<prefix>autopl [<playlist name>|\"unset\"]"
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
      // Get auto playlist.
      this.queueService.getAutoPL().then((autoPl) => {
        this.chatService.simpleNote(msg, `Current auto playlist: ${autoPl}`, this.chatService.msgType.INFO);
      }).
        catch((err) => {
          this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
        });
    } else if (payload === "unset") {
      // Unset auto playlist.
      this.queueService.unsetAutoPL();
      this.chatService.simpleNote(msg, "Auto playlist unset.", this.chatService.msgType.MUSIC);
    } else {
      // Set auto playlist.
      const note = `Auto playlist set to: ${payload}`;
      this.queueService.setAutoPL(payload).
        then(() => this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC)).
        catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
    }
  }
}

module.exports = AutoPLCommand;
