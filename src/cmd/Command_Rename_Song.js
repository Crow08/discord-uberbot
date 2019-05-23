/* eslint-disable max-len */
const Command = require("./Command.js");

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
    console.log("renaming..");
    let flag = payload.split(" ")[0];
    if (flag === "a") {
      flag = "artist";
    } else if (flag === "t") {
      flag = "title";
    }
    const plName = payload.split(" ")[1];
    const songNr = payload.split(" ")[2];
    const newName = payload.substr(flag.length + plName.length + songNr.length - 1);

    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 4 || ["a", "t"].includes(flag) || isNaN(songNr)) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

    this.dbService.getPlaylist(plName).then((songs) => {
      const song = songs[songNr - 1];
      this.dbService.renameSong(plName, song, flag, newName);
      this.chatService.simpleNote(msg, `renaming ${flag} of ${song.title} into ${newName}`, this.chatService.msgType.MUSIC);
    });
  }
}
module.exports = RenameSongCommand;
