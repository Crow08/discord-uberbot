const Command = require("./Command.js");

/**
 * Class for pause command.
 * @extends Command
 */
class PauseCommand extends Command {
  constructor(playerService) {
    super("pause");
    super.help = "pause current playback.";
    super.usage = "<prefix>pause";
    super.alias = ["pause"];
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.pause(msg);
  }
}

module.exports = PauseCommand;
