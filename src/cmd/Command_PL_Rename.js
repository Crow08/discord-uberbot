const Command = require("./Command.js");

/**
 * Class for rename playlist command.
 * @extends Command
 * @Category Commands
 */
class RenamePLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dbService) {
    super(
      ["plrename", "rename"],
      "renames given playlist",
      "<prefix>rename <playlist> <new name>"
    );
    this.chatService = chatService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const plName = payload.split(" ")[0];
    const newName = payload.split(" ")[1];
    this.dbService.renamePL(plName, newName).then(() => {
      this.chatService.send(msg, `renamed Playlist "${plName}" to "${newName}"`);
    }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
      });
  }
}
module.exports = RenamePLCommand;
