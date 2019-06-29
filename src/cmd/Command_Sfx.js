const Command = require("./Command.js");
const voiceLines = require("../../voiceLines.json");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class SfxCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {RawFileService} rawFileService - RawFileService.
   */
  constructor(voiceService, rawFileService, chatService) {
    super(
      ["sfx"],
      "make the bot play dumb stuff",
      "<prefix>sfx [index of sfx]"
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
    if (payload === "undefined" || payload === "") {
      let list = "```asciidoc\n[Sound effects]\n\n";
      voiceLines.sfx.forEach((element, index) => {
        console.log(`${index} :: ${element.title}\n`);
        list += `${index} :: ${element.title}\n`;
      });
      list += "```";
      this.chatService.send(msg, list);
    } else {
      const sfxUrl = voiceLines.sfx[payload].url;
      this.rawFileService.getStream(sfxUrl).
        then((sfx) => {
          this.voiceService.getVoiceConnection(msg).
            then((voiceConnection) => {
              voiceConnection.play(sfx);
            });
        }).
        catch(((err) => console.log(err)));
      msg.delete({"timeout": 10000});
    }

  }
}
module.exports = SfxCommand;
