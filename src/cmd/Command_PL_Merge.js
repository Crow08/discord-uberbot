const Command = require("./Command.js");

/**
 * Class for merge two playlists command.
 * @extends Command
 * @Category Commands
 */
class MergePLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dbService) {
    super(
      ["plmerge", "merge"],
      "copies one playlist into another!",
      "<prefix>merge <sourcepl> <targetpl>"
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
    const source = payload.split(" ")[0];
    const target = payload.split(" ")[1];
    this.dbService.mergePlaylists(source, target);
    this.chatService.send(msg, `copied playlist ${source} into playlist ${target}`);
  }
}
module.exports = MergePLCommand;
