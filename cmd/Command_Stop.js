const Command = require("./Command.js");

class StopCommand extends Command {
  constructor(playerService) {
    super("stop");
    super.help = "Stop current playback.";
    super.usage = "<prefix>stop";
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.stop(msg);
  }
}

module.exports = StopCommand;
