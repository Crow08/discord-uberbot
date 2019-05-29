const Command = require("./Command.js");

/**
 * Class for skip song command.
 * @extends Command
 * @Category Commands
 */
class SkipCommand extends Command {

  /**
   * Constructor.
   * @param {PlayerService} playerService - PlayerService.
   */
  constructor(playerService) {
    super("skip");
    super.help = "skip current song.";
    super.usage = "<prefix>skip";
    super.alias = ["skip", "s"];
    this.playerService = playerService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.playerService.skip(msg);
  }
}

module.exports = SkipCommand;
