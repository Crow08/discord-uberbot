const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class SayCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {TTSService} ttsService - TTSService.
   */
  constructor(voiceService, ttsService) {
    super(
      ["say"],
      "make the bot say dumb stuff",
      "<prefix>say"
    );
    this.ttsService = ttsService;
    this.voiceService = voiceService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.voiceService.getVoiceConnection(msg).
      then((voiceConnection) => {
        this.ttsService.announceMessage(payload, voiceConnection);
      }).
      catch((err) => console.log(err));
    msg.delete({"timeout": 10000});
  }
}
module.exports = SayCommand;
