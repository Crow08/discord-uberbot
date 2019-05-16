const Command = require("./Command.js");

class RemovePLCommand extends Command {
  constructor(chatService, dbService) {
    super("plremove");
    super.help = "remove given song from given playlist";
    super.usage = "<prefix>plremove <pl name> <songname>";
    super.alias = ["plremove", "plrm"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg, "falscher Syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const songName = payload.substr(plName.length + 1);
    this.dbService.removeSong(songName, plName).then((info) => {
      if (info.deletedCount === 0) {
        const note = `"${songName}" wurde nicht in ${plName} gefunden`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
      } else {
        this.chatService.simpleNote(msg, `Song aus ${plName} entfernt`, this.chatService.msgType.INFO);
      }
    });
  }
}
module.exports = RemovePLCommand;
