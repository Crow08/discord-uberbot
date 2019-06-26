const Command = require("./Command.js");

/**
 * Class for leave channel command.
 * @extends Command
 * @Category Commands
 */
class LeaveCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   */
  constructor(voiceService) {
    super(
      ["leave"],
      "leave the current voice channel.",
      "<prefix>leave"
    );
    this.voiceService = voiceService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.voiceService.disconnectVoiceConnection(msg);
  }
}

module.exports = LeaveCommand;
