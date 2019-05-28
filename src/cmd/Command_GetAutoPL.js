const Command = require("./Command.js");

/**
 * Class for get auto playlist command.
 * @extends Command
 */
class GetAutoPLCommand extends Command {
  constructor(chatService, queueService) {
    super("getautopl");
    super.help = "returns name of current auto playlist";
    super.usage = "<prefix>auto";
    super.alias = ["auto"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    this.queueService.getAutoPL().then((autoPl) => {
      this.chatService.simpleNote(msg, `Current auto playlist: ${autoPl}`, this.chatService.msgType.INFO);
    }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
      });
  }
}
module.exports = GetAutoPLCommand;
