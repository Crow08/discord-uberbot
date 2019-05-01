const Command = require("./Command.js");

class StopCommand extends Command {
  constructor(playerService) {
    super("stop");
    super.help = "stop current playback.";
    super.usage = "<prefix>stop";
    super.alias = ["stop"];
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.stop(msg);
  }
}

module.exports = StopCommand;
