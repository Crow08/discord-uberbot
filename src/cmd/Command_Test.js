const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, queueService, discord, dbService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.discord = discord;
    this.dbService = dbService;
  }

  run(payload, msg) {
    console.log("testing");
    this.queueService.getAutoPL().then((autoPl) => {
      this.chatService.simpleNote(msg, autoPl, this.chatService.msgType.INFO);
    }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
      });

    /* X
    console.log("merging playlists:");
    const source = payload.split(" ")[0];
    const target = payload.split(" ")[1];
    this.dbService.mergePlaylists(source, target).then(() => {
      console.log("merging...");
    });
    */
  }
}
module.exports = TestCommand;
