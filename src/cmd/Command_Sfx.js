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
  constructor(voiceService, rawFileService, chatService, ttsService) {
    super(
      ["sfx"],
      "make the bot play dumb stuff",
      "<prefix>sfx [index of sfx / empty for whole list]"
    );
    this.voiceService = voiceService;
    this.rawFileService = rawFileService;
    this.chatService = chatService;
    this.ttsService = ttsService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (payload > voiceLines.sfx.length - 1) {
      this.say("This is a voice line from the future. You have to add it first!", msg);
      return;
    }
    if (payload < 0) {
      this.say("Oh I know, let's enter a negative number, that will show her. Pathetic!", msg);
      return;
    }
    if (isNaN(payload)) {
      this.say("Oh my goodness, what are you doing? Please enter a number. You know? Like 1 or 2?", msg);
      return;
    }
    if (payload === "undefined" || payload === "" || payload.length === 0) {
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

  say(text, msg) {
    this.voiceService.getVoiceConnection(msg).
      then((voiceConnection) => {
        this.ttsService.announceMessage(text, voiceConnection);
      }).
      catch((err) => console.log(err));
    msg.delete({"timeout": 10000});
  }
}
module.exports = SfxCommand;
