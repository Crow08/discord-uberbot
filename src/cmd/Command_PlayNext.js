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
    console.log("testing");
    if (isNaN(payload)) {

      for (let count = 0; count < this.queueService.queue.length; count++) {
        console.log("%d: %s", count, this.queueService.queue[count].title);
        console.log(this.queueService.queue[count].title.toLowerCase().indexOf(payload.toLowerCase()));
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
      // eslint-disable-next-line max-len
      this.chatService.simpleNote(msg, this.queueService.prioritizeSong(parseInt(payload, 10) - 1), this.chatService.msgType.MUSIC);
    }
  }
}
module.exports = PlayNextCommand;
