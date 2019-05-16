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
    this.queueService.getCurrentSong().
      then((nowplaying) => {
        const embed = new this.chatService.DiscordMessageEmbed();
        if (typeof nowplaying === "undefined") {
          embed.setColor(13632027);
          embed.addField("Are you deaf?", "Go check your ears, there is clearly nothing playing right now!", true);
        } else {
          this.chatService.displaySong(
            msg, nowplaying,
            (rSong, user, delta, ignoreCd) => this.ratingService.rateSong(rSong, user, delta, ignoreCd)
          );
        }
        this.chatService.send(msg, embed);
      });
  }
}

module.exports = NowPlayingCommand;
