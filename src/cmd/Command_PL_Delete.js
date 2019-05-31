const Command = require("./Command.js");

/**
 * Class for delete playlist command.
 * @extends Command
 * @Category Commands
 */
class DeletePLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dBService) {
    super("pldelete");
    super.help = "deletes a playlist permanently.";
    super.usage = "<prefix>pldelete <pl name>";
    super.alias = ["pldelete"];
    this.chatService = chatService;
    this.dBService = dBService;
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
    const note = `playlist deleted: ${plName}`;
    this.dBService.deletePlaylist(plName).
      then(() => this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC)).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = DeletePLCommand;
