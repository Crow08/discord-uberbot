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
  constructor(chatService, voiceService, rawFileService, baseClient) {
    super(
      ["test"],
      "for testing - duh!",
      "<prefix>test"
    );
    this.chatService = chatService;
    this.voiceService = voiceService;
    this.rawFileService = rawFileService;
    this.baseClient = baseClient;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const channel = this.baseClient.channels.get(msg.member.voice.channel.id);
    channel.join();
  }
}
module.exports = TestCommand;
