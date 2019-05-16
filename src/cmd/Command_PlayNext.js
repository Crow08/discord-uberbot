const Command = require("./Command.js");

class PlayNextCommand extends Command {
  constructor(chatService, queueService) {
    super("playnext");
    super.help = "moves song at given position to top";
    super.usage = "<prefix>playnext <queueposition>";
    super.alias = ["playnext", "pn"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length > 1) {
      this.chatService.simpleNote(msg, "What are you doing?", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    if (isNaN(payload)) {
      for (let count = 0; count < this.queueService.queue.length; count++) {
        if (this.queueService.queue[count].title.toLowerCase().indexOf(payload.toLowerCase()) >= 0) {
          this.chatService.simpleNote(msg, this.queueService.prioritizeSong(count), this.chatService.msgType.MUSIC);
          return;
        } else if (this.queueService.queue[count].artist.toLowerCase().indexOf(payload.toLowerCase()) >= 0) {
          this.chatService.simpleNote(msg, this.queueService.prioritizeSong(count), this.chatService.msgType.MUSIC);
          return;
        }
      }
      this.chatService.simpleNote(msg, `${payload} not found`, this.chatService.msgType.FAIL);
    } else {
      const index = parseInt(payload, 10) - 1;
      this.chatService.simpleNote(msg, this.queueService.prioritizeSong(index), this.chatService.msgType.MUSIC);
    }
  }
}
module.exports = PlayNextCommand;
