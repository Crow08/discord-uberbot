const Command = require("./Command.js");

class NowPlayingCommand extends Command {
  constructor(chatService, queueService, ratingService, discord) {
    super("nowplaying");
    super.help = "returns first song in history (current song)";
    super.usage = "<prefix>nowplaying";
    super.alias = ["nowplaying", "np"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.ratingService = ratingService;
    this.discord = discord;
  }

  run(payload, msg) {
    const nowplaying = this.queueService.history[0];
    if (typeof nowplaying === "undefined") {
      const embed = new this.discord.RichEmbed();
      embed.setColor(13632027);
      embed.addField("Are you deaf?", "Go check your ears, there is clearly nothing playing right now!", true);
      this.chatService.richNote(msg, embed);
    } else {
      this.chatService.displaySong(msg, nowplaying, this.ratingService.rateSong);
    }
  }
}

module.exports = NowPlayingCommand;
