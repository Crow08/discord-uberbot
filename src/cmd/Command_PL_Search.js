const Command = require("./Command.js");

class SearchPLCommand extends Command {
  constructor(chatService, dbService, ratingService) {
    super("plsearch");
    super.help = "search given song in given playlist";
    super.usage = "<prefix>plsearch <pl name> <songname>";
    super.alias = ["plsearch", "pls"];
    this.chatService = chatService;
    this.dbService = dbService;
    this.ratingService = ratingService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg, "falscher Syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const songName = payload.substr(plName.length + 1);
    this.dbService.findSong(songName, plName).then((song) => {
      if (song === "null") {
        const note = `"${songName}" wurde nicht in ${plName} gefunden`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
      } else {
        this.chatService.displaySong(msg, song, (rSong, usr, delta, ignoreCd) => this.ratingService.rateSong(rSong, usr, delta, ignoreCd));
      }
    });
  }
}
module.exports = SearchPLCommand;
