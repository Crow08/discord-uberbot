const Command = require("./Command.js");

/**
 * Class for skip song command.
 * @extends Command
 */
class SkipCommand extends Command {
  constructor(playerService) {
    super("skip");
    super.help = "skip current song.";
    super.usage = "<prefix>skip";
    super.alias = ["skip", "s"];
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.skip(msg);
  }
}

module.exports = SkipCommand;
