const Command = require("./Command.js");

/**
 * Class for leave channel command.
 * @extends Command
 */
class LeaveCommand extends Command {
  constructor(playerService, voiceService) {
    super("leave");
    super.help = "leave the current voice channel.";
    super.usage = "<prefix>leave";
    super.alias = ["leave"];
    this.voiceService = voiceService;
    this.playerService = playerService;
  }

  run(payload, msg) {
    this.playerService.stop(msg);
    this.voiceService.disconnectVoiceConnection(msg);
  }
}

module.exports = LeaveCommand;
