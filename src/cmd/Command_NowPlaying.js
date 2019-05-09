const Command = require("./Command.js");

class NowPlayingCommand extends Command {
  constructor(chatService, queueService, ratingService) {
    super("nowplaying");
    super.help = "returns first song in history (current song)";
    super.usage = "<prefix>nowplaying";
    super.alias = ["nowplaying", "np"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.ratingService = ratingService;
  }

  run(payload, msg) {
    const song = this.queueService.history[0];
    if (typeof song === "undefined") {
      const embed = new this.chatService.DiscordRichEmbed();
      embed.setColor(13632027);
      embed.addField("Are you deaf?", "Go check your ears, there is clearly nothing playing right now!", true);
      this.chatService.richNote(msg, embed);
    } else {
      this.chatService.displaySong(msg, song, (rSong, user, delta) => this.ratingService.rateSong(rSong, user, delta));
    }
  }
}

module.exports = NowPlayingCommand;
