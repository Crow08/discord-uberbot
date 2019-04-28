const Command = require("./Command.js");

class PauseCommand extends Command {
  constructor(playerService) {
    super("pause");
    super.help = "pause current playback.";
    super.usage = "<prefix>pause";
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.pause(msg);
  }
}

module.exports = PauseCommand;
