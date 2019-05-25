const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, queueService, dbService, voiceService, playerService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
    this.voiceService = voiceService;
    this.playerService = playerService;
  }

  run(payload, msg) {
    console.log(this.playerService.audioDispatcher.Volume);
    this.playerService.audioDispatcher.setVolume(payload);
    console.log(this.playerService.audioDispatcher.Volume);
  }
}
module.exports = TestCommand;
