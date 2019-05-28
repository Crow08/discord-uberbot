const Command = require("./Command.js");

/**
 * Class for rename song in playlist command.
 * @extends Command
 */
class RenameSongCommand extends Command {
  constructor(chatService, dbService) {
    super("renamesong");
    super.help = "rename title or artist of song";
    super.usage = "<prefix>renamesong <t(itle)/a(rtist)> <playlist> <song number> <new Name>";
    super.alias = ["renamesong", "rs"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.split(" ").length < 4 ||
      !["a", "t", "artist", "title"].includes(payload.split(" ")[0]) || isNaN(payload.split(" ")[2])) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

    let flag = payload.split(" ")[0];
    flag = flag === "a" ? "artist" : flag;
    flag = flag === "t" ? "title" : flag;
    const plName = payload.split(" ")[1];
    const songNr = payload.split(" ")[2];
    const newName = payload.substr(flag.length + plName.length + songNr.length - 1);

    this.dbService.getPlaylist(plName).then((songs) => {
      const song = songs[songNr - 1];
      this.dbService.renameSong(plName, song, flag, newName);
      const note = `renaming ${flag} of ${song.title} into ${newName}`;
      this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
    });
  }
}
module.exports = RenameSongCommand;
