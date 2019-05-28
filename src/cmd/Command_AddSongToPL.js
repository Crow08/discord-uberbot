const Command = require("./Command.js");

/**
 * Class for add song to playlist command.
 * @extends Command
 */
class AddSongToPlCommand extends Command {
  constructor(chatService, queueService, dbService) {
    super("addsongtopl");
    super.help = "adds current song to given playlist";
    super.usage = "<prefix>addsongtopl <playlist>";
    super.alias = ["addsongtopl", "as2pl", "as2p"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
    }
    this.queueService.getCurrentSong().then((nowPlaying) => {
      this.dbService.addSong(nowPlaying, payload).then(() => {
        const note = `added ${nowPlaying.title} to Playlist ${payload}`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.INFO);
      });
    });

  }
}

module.exports = AddSongToPlCommand;
