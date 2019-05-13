const Command = require("./Command.js");

class AddSongToPlCommand extends Command {
  constructor(chatService, queueService, dbService) {
    super("addsongtopl");
    super.help = "adds current song to given playlist";
    super.usage = "<prefix>addsongtopl";
    super.alias = ["addsongtopl", "as2pl", "as2p"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    console.log(`Payload: ${payload}`);
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "falscher Syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
    }
    this.queueService.getCurrentSong().then((nowplaying) => {
      console.log(nowplaying);
      console.log(`add song ${nowplaying.title} to pl ${payload}`);
      this.dbService.addSong(nowplaying, payload).then(() => {
        const note = `added ${nowplaying.title} to Playlist ${payload}`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.INFO);
      });
    });

  }
}

module.exports = AddSongToPlCommand;
