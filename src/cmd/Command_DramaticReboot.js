const Command = require("./Command.js");
const voiceLines = require("../../voiceLines.json");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class DramaticRebootCommand extends Command {

  /**
 *
 * @param {VoiceService} voiceService
 * @param {RawFileService} rawFileService
 * @param {ChatService} chatService
 */
  constructor(voiceService, rawFileService, chatService) {
    super(
      ["reboot"],
      "kills the bot, hopefully it will restart again",
      "<prefix>reboot"
    );
    this.voiceService = voiceService;
    this.rawFileService = rawFileService;
    this.chatService = chatService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    console.log("committing Sudoku");
    this.rawFileService.getStream(voiceLines.special.die).
      then((sfx) => {
        this.voiceService.getVoiceConnection(msg).
          then((voiceConnection) => {
            voiceConnection.play(sfx);
          });
      }).
      catch(((err) => console.log(err)));
    setTimeout(
      () => {
        process.exit(1337);
      },
      10000
    );
  }
}
module.exports = DramaticRebootCommand;
