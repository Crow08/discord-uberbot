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
  constructor(chatService, voiceService, ttsService, rawFileService) {
    super(
      ["test"],
      "for testing - duh!",
      "<prefix>test"
    );
    this.chatService = chatService;
    this.voiceService = voiceService;
    this.ttsService = ttsService;
    this.rawFileService = rawFileService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.voiceService.getVoiceConnection(msg).then((voiceConnection) => {
      this.ttsService.getStream("the quick brown fox jumps over the lazy dog").then((stream) => {
        console.log(stream);
        voiceConnection.play(stream);
      });
    });
  }
}
module.exports = TestCommand;
