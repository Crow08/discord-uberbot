const Command = require("./Command.js");

class LoadPLCommand extends Command {
  constructor(chatService, queueService) {
    super("plload");
    super.help = "load a playlist replaceing the current queue.";
    super.usage = "<prefix>plload <pl name>";
    super.alias = ["plload"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "No playlist name found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.trim();
    const note = `playlist loaded: ${plName}`;
    this.queueService.loadPlaylist(plName).
      then(() => this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC)).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = LoadPLCommand;
