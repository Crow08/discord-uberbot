const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class JoinCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   */
  constructor(voiceService) {
    super(
      ["join"],
      "ask bot nicely to join your channel",
      "<prefix>join"
    );
    this.voiceService = voiceService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.voiceService.getVoiceConnection(msg);
  }
}
module.exports = JoinCommand;
