const Command = require("./Command.js");

/**
 * Class for get auto playlist command.
 * @extends Command
 * @Category Commands
 */
class GetAutoPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(chatService, queueService) {
    super("getautopl");
    super.help = "returns name of current auto playlist";
    super.usage = "<prefix>auto";
    super.alias = ["auto"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
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
