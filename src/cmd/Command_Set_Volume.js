/* eslint-disable max-len */
const Command = require("./Command.js");

class SetVolumeCommand extends Command {
  constructor(chatService, voiceService) {
    super("setvolume");
    super.help = "sets volume, updates after next song";
    super.usage = "<prefix>setvolume <number>";
    super.alias = ["setvolume", "setvol", "sv"];
    this.chatService = chatService;
    this.voiceService = voiceService;
  }

  run(payload, msg) {
    if (isNaN(payload)) {
      this.chatService.simpleNote(msg, `What the fuck, are you doing? Ever heard of a volume setting named "${payload}"?`, this.chatService.msgType.FAIL);
    } else if (payload > 200 || payload < 0) {
      this.chatService.simpleNote(msg, "A cheeky one, aren't you? Try with numbers between 0 and 200", this.chatService.msgType.FAIL);
    } else {
      this.chatService.simpleNote(msg, `Set Volume to  ${payload}, will update with next song played`, this.chatService.msgType.MUSIC);
      this.voiceService.volume = payload;
    }
  }
}
module.exports = SetVolumeCommand;
