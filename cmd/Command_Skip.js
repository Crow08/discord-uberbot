const Command = require("./Command.js");

class SkipCommand extends Command {
  constructor(playerService) {
    super("skip");
    super.help = "Skip current song.";
    super.usage = "<prefix>skip";
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.next(msg);
  }
}

module.exports = SkipCommand;
