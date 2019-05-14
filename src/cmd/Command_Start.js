const Command = require("./Command.js");

class StartCommand extends Command {
  constructor(playerService, searchService, chatService, queueService) {
    super("start");
    super.help = "loads a playlist shuffles it and starts playling.";
    super.usage = "<prefix>start <pl name>";
    super.alias = ["start"];
    this.playerService = playerService;
    this.searchService = searchService;
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    // Get playlist
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "No playlist name found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.trim();
    const message = `playlist loaded: ${plName}`;
    this.queueService.loadPlaylist(plName).
      then(() => {
        this.chatService.simpleNote(msg, message, this.chatService.msgType.MUSIC);
        // Shuffle playlist
        this.queueService.shuffleQueue();
        this.chatService.simpleNote(msg, "Queue shuffled!", this.chatService.msgType.MUSIC);

        // Start playing
        this.playerService.play(msg);
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = StartCommand;
