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
    if (isNaN(payload)) {

      for (let count = 0; count < this.queueService.queue.length; count++) {
        console.log("%d: %s", count, this.queueService.queue[count].title);
        console.log(this.queueService.queue[count].title.toLowerCase().indexOf(payload.toLowerCase()));
        if (this.queueService.queue[count].title.toLowerCase().indexOf(payload.toLowerCase()) >= 0) {
          this.chatService.simpleNote(msg, this.queueService.prioritizeSong(count), this.chatService.msgType.MUSIC);
          return;
        }
      }
      this.chatService.simpleNote(msg, `${payload} not found`, this.chatService.msgType.FAIL);
    } else {
      // eslint-disable-next-line max-len
      this.chatService.simpleNote(msg, this.queueService.prioritizeSong(parseInt(payload, 10) - 1), this.chatService.msgType.MUSIC);
    }
  }
}
module.exports = TestCommand;
