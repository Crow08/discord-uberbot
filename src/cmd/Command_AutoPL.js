const Command = require("./Command.js");

class AutoPLCommand extends Command {
  constructor(chatService, queueService) {
    super("autopl");
    super.help = "set a playlist to be the auto playlist.\n(leave playlist name empty to unset auto playlist).";
    super.usage = "<prefix>autopl [<playlist name>]";
    super.alias = ["autopl", "apl"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.queueService.unsetAutoPL();
      this.chatService.simpleNote(msg, "Auto playlist unset.", this.chatService.msgType.MUSIC);
      return;
    }
    const note = `Auto playlist set to: ${payload}`;
    this.queueService.setAutoPL(payload).
      then(() => this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC)).
      catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
  }
}

module.exports = AutoPLCommand;
