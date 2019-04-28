const Command = require("./Command.js");

class PlayCommand extends Command {
  constructor(chatService, playerService, searchService) {
    super("play");
    super.help = "Play a song by URL or query.";
    super.usage = "<prefix>play <URL or query>";
    this.playerService = playerService;
    this.chatService = chatService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.playerService.play(msg);
      return;
    }
    this.searchService.search(payload, msg).then((song) => {
      if (Array.isArray(song)) {
        this.playerService.playMultipleNow(song, msg);
      } else {
        this.playerService.playNow(song, msg);
      }
    }).catch();
  }
}

module.exports = PlayCommand;
