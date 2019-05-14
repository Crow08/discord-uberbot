const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, queueService, dbService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    console.log("testing");
    const source = payload.split(" ")[0];
    const target = payload.split(" ")[1];
    this.chatService.send(msg, this.dbService.mergePlaylists(source, target));
  }
}
module.exports = TestCommand;
