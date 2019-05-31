const Command = require("./Command.js");

/**
 * Class for stop command.
 * @extends Command
 * @Category Commands
 */
class StopCommand extends Command {

  /**
   * Constructor.
   * @param {PlayerService} playerService - PlayerService.
   */
  constructor(playerService) {
    super("stop");
    super.help = "stop current playback.";
    super.usage = "<prefix>stop";
    super.alias = ["stop"];
    this.playerService = playerService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.playerService.stop(msg);
  }
}

module.exports = StopCommand;
