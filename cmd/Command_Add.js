const Command = require("./Command.js");

class AddCommand extends Command {
  constructor(chatService, queueService, searchService) {
    super("add");
    super.help = "add a song to the current queue by URL or query.";
    super.usage = "<prefix>add <URL or query>";
    this.chatService = chatService;
    this.queueService = queueService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    console.log("add!!!");
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg.channel, "No URL or query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    this.searchService.search(payload, msg).then((song) => {
      if (Array.isArray(song)) {
        this.queueService.addMultipleToQueue(song, msg);
        this.chatService.simpleNote(msg.channel, `${song.length()}songs added to queue.`, this.chatService.msgType.MUSIC);
      } else {
        this.queueService.addToQueue(song, msg);
        this.chatService.simpleNote(msg.channel, "song added to queue.", this.chatService.msgType.MUSIC);
      }
    }).catch();
  }
}

module.exports = AddCommand;
