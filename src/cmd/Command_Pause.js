const Command = require("./Command.js");

/**
 * Class for pause command.
 * @extends Command
 * @Category Commands
 */
class PauseCommand extends Command {

  /**
   * Constructor.
   * @param {PlayerService} playerService - PlayerService.
   */
  constructor(playerService) {
    super("pause");
    super.help = "pause current playback.";
    super.usage = "<prefix>pause";
    super.alias = ["pause"];
    this.playerService = playerService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.playerService.pause(msg);
  }
}

module.exports = PauseCommand;
