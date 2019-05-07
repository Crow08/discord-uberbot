const Command = require("./Command.js");

class AutoPLCommand extends Command {
  constructor(chatService, queueService) {
    super("autopl");
    super.help = "set a playlist to be the autoplaylist.\n(leave playlist name empty to unset autoplaylist).";
    super.usage = "<prefix>autopl [<playlist name>]";
    super.alias = ["autopl"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.queueService.unsetAutoPL();
      this.chatService.simpleNote(msg.channel, "autoplaylist unset.", this.chatService.msgType.MUSIC);
      return;
    }
    const note = `Autoplaylist set to: ${payload}`;
    this.queueService.setAutoPL(payload).
      then(() => this.chatService.simpleNote(msg.channel, note, this.chatService.msgType.MUSIC)).
      catch((err) => this.chatService.simpleNote(msg.channel, err, this.chatService.msgType.Fail));
  }
}

module.exports = AutoPLCommand;
