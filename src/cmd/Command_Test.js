const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class TestCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {DbService} dbService - DbService.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {PlayerService} playerService - PlayerService.
   */
  constructor(chatService, queueService, dbService, voiceService, playerService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
    this.voiceService = voiceService;
    this.playerService = playerService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    console.log(payload);
    console.log(msg);
  }
}
module.exports = TestCommand;
