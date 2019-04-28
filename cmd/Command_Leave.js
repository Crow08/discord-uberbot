const Command = require("./Command.js");

class LeaveCommand extends Command {
  constructor(voiceService) {
    super("leave");
    super.help = "leave the current voice channel.";
    super.usage = "<prefix>leave";
    this.voiceService = voiceService;
  }

  run(payload, msg) {
    this.voiceService.disconnectVoiceConnection(msg);
  }
}

module.exports = LeaveCommand;
