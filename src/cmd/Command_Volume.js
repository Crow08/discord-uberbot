const Command = require("./Command.js");

/**
 * Class for get and set volume command.
 * @extends Command
 */
class VolumeCommand extends Command {
  constructor(chatService, voiceService, playerService) {
    super("volume");
    super.help = "sets volume, or returns volume if no parameter given";
    super.usage = "<prefix>volume <number>";
    super.alias = ["volume", "vol", "v"];
    this.chatService = chatService;
    this.voiceService = voiceService;
    this.playerService = playerService;
  }

  run(payload, msg) {
    if (!payload) {
      const note = `Volume is set to  ${this.voiceService.volume} right now`;
      this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
    } else if (isNaN(payload)) {
      const note = `What the fuck, are you doing? Ever heard of a volume setting named "${payload}"?`;
      this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
    } else if (payload > 200 || payload < 0) {
      const note = "A cheeky one, aren't you? Try with numbers between 0 and 200";
      this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
    } else {
      this.chatService.simpleNote(msg, `Set Volume to  ${payload}`, this.chatService.msgType.MUSIC);
      this.voiceService.volume = payload;
      if (this.playerService.audioDispatcher) {
        this.playerService.audioDispatcher.setVolume(payload / 100);
        console.log(this.playerService.audioDispatcher.volume);
      }

    }
  }
}
module.exports = VolumeCommand;
