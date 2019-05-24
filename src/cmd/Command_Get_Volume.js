/* eslint-disable max-len */
const Command = require("./Command.js");

class GetVolumeCommand extends Command {
  constructor(chatService, voiceService) {
    super("getvolume");
    super.help = "outputs current volume";
    super.usage = "<prefix>getvolume";
    super.alias = ["getvolume", "getvol", "gv"];
    this.chatService = chatService;
    this.voiceService = voiceService;
  }

  run(payload, msg) {
    if (payload) {
      this.chatService.simpleNote(msg, "This method does not take parameters, even if you say please!", this.chatService.msgType.FAIL);
    }
    this.chatService.simpleNote(msg, `Volume is set to ${this.voiceService.volume} right now`, this.chatService.msgType.MUSIC);
    this.voiceService.volume = payload;
  }
}
module.exports = GetVolumeCommand;
