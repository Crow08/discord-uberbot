const Command = require("./Command.js");

/**
 * Class for leave channel command.
 * @extends Command
 * @Category Commands
 */
class LeaveCommand extends Command {

  /**
   * Constructor.
   * @param {PlayerService} playerService - PlayerService.
   * @param {VoiceService} voiceService - VoiceService.
   */
  constructor(playerService, voiceService) {
    super("leave");
    super.help = "leave the current voice channel.";
    super.usage = "<prefix>leave";
    super.alias = ["leave"];
    this.voiceService = voiceService;
    this.playerService = playerService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.playerService.stop(msg);
    this.voiceService.disconnectVoiceConnection(msg);
  }
}

module.exports = LeaveCommand;
