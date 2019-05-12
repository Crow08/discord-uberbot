const Command = require("./Command.js");

class GetAutoPLCommand extends Command {
  constructor(chatService, queueService) {
    super("getautopl");
    super.help = "returns name of current autoplaylist";
    super.usage = "<prefix>auto";
    super.alias = ["auto"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    console.log("returning name of current autoplaylist");
    this.queueService.getAutoPL().then((autoPl) => {
      this.chatService.simpleNote(msg.channel, `Current autoplaylist: ${autoPl}`, this.chatService.msgType.INFO);
    }).
      catch((err) => {
        this.chatService.simpleNote(msg.channel, err, this.chatService.msgType.FAIL);
      });
  }
}
module.exports = GetAutoPLCommand;
