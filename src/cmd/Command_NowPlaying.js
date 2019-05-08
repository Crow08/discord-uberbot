const Command = require("./Command.js");

class NowPlayingCommand extends Command {
  constructor(chatService, queueService, discord) {
    super("nowplaying");
    super.help = "returns first song in history (current song)";
    super.usage = "<prefix>nowplaying";
    super.alias = ["nowplaying", "np"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.discord = discord;
  }

  run(payload, msg) {
    console.log("Getting Current Song...");
    const nowplaying = this.queueService.history[0];
    const embed = new this.discord.RichEmbed();
    console.log(nowplaying);
    if (typeof nowplaying === "undefined") {
      embed.setColor(13632027);
      embed.addField("Are you deaf?", "Go check your ears, there is clearly nothing playing right now!", true);
    } else {
      this.chatService.displaySong(msg, nowplaying);
    }
    this.chatService.richNote(msg.channel, embed);
  }
}

module.exports = NowPlayingCommand;
