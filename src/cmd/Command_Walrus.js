const Command = require("./Command.js");
const voiceLines = require("../../voiceLines.json");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class WalrusCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {RawFileService} rawFileService - RawFileService.
   */
  constructor(voiceService, rawFileService) {
    super(
      ["walrus", "urf"],
      "make the bot do a walrus sound",
      "<prefix>walrus"
    );
    this.voiceService = voiceService;
    this.rawFileService = rawFileService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.rawFileService.getStream(sounds[getRandomInt(sounds.length)]).
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

  // all the walrus sounds
  var sounds = [
  'https://cdn.discordapp.com/attachments/561903849330442261/594483655078838283/Weil_das_ja_klar_ist.wav',
  'https://cdn.discordapp.com/attachments/561903849330442261/594483639161454592/Ololooooo.wav',
  'https://cdn.discordapp.com/attachments/561903849330442261/594486830045462531/arrow.mp3'
  ];

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
module.exports = WalrusCommand;
