const Command = require("./Command.js");

class PlayCommand extends Command {
  constructor(chatService, playerService, searchService) {
    super("play");
    super.help = "play a song by url or query.";
    super.usage = "<prefix>play <url or query>";
    super.alias = ["play", "p"];
    this.playerService = playerService;
    this.chatService = chatService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.playerService.play(msg);
      return;
    }
    this.searchService.search(payload).
      then(({note, song}) => {
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
        if (Array.isArray(song)) {
          this.playerService.playMultipleNow(song, msg);
        } else {
          this.playerService.playNow(song, msg);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = PlayCommand;
