const Command = require("./Command.js");

class StopCommand extends Command {
  constructor(playerService, chatService) {
    super("seek");
    super.help = "seek playback position.";
    super.usage = "<prefix>seek <number>";
    super.alias = ["seek"];
    this.playerService = playerService;
    this.chatService = chatService;
  }

  run(payload, msg) {
    if (isNaN(payload)) {
      this.chatService.simpleNote(msg.channel, "Seek position must be numeric!", this.chatService.msgType.Fail);
    }
    this.playerService.seek(payload, msg);
  }
}

module.exports = StopCommand;
