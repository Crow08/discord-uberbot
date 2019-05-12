const Command = require("./Command.js");

class StopCommand extends Command {
  constructor(chatService, playerService) {
    super("seek");
    super.help = "seek playback position.";
    super.usage = "<prefix>seek <number>";
    super.alias = ["seek"];
    this.playerService = playerService;
    this.chatService = chatService;
  }

  run(payload, msg) {
    if (isNaN(payload)) {
      this.chatService.simpleNote(msg, "Seek position must be numeric!", this.chatService.msgType.Fail);
      return;
    }
    this.playerService.seek(payload, msg);
  }
}

module.exports = StopCommand;
