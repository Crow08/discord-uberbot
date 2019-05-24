const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, queueService, dbService, voiceService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
    this.voiceService = voiceService;
  }

  run(payload, msg) {
    this.voiceService.getVoiceConnection(msg).
      then((conn) => {
        console.log(conn);
        conn.setVolume(0.5);
        console.log(conn);
      }).
      catch((reject) => {
        console.log(reject);
      });
  }
}
module.exports = TestCommand;
