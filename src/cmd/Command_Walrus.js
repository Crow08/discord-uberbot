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
  'https://cdn.discordapp.com/attachments/561903849330442261/735396064672088114/urf1.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396204799852614/urf2.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396199309246534/urf3.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396194171224105/urf4.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396189121413120/urf5.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396184386174987/urf6.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396180166443048/urf7.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396175586263083/urf8.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396170959945728/urf9.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396166543343636/urf10.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396161976008754/urf11.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396156577939546/urf12.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396151682924594/urf13.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396147400540240/urf14.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396143021686874/urf15.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396139234492416/urf16.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396135572733962/urf17.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396130497757184/urf18.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396116140392488/urf19.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735397127055867965/urf20.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735397131849957386/urf21.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396089557155880/urf22.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396088084693032/urf23.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396086792978473/urf24.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396085584887858/urf25.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396084167344148/urf26.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396082909184020/urf27.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396081684185098/urf28.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396081302503494/urf29.mp3',
  'https://cdn.discordapp.com/attachments/561903849330442261/735396072331018240/urf30.mp3'
  ];

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
module.exports = WalrusCommand;
