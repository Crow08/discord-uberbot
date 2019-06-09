const Command = require("./Command.js");

/**
 * Class for display current song command.
 * @extends Command
 * @Category Commands
 */
class NowPlayingCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {RatingService} ratingService - RatingService.
   */
  constructor(chatService, queueService, ratingService) {
    super("nowplaying");
    super.help = "returns first song in history (current song)";
    super.usage = "<prefix>nowplaying";
    super.alias = ["nowplaying", "np"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.ratingService = ratingService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.queueService.getCurrentSong().
      then((nowPlaying) => {
        const embed = new this.chatService.DiscordMessageEmbed();
        if (typeof nowPlaying === "undefined") {
          embed.setColor(13632027);
          embed.addField("Are you deaf?", "Go check your ears, there is clearly nothing playing right now!", true);
          this.chatService.send(msg, embed);
        } else {
          this.chatService.displaySong(
            msg, nowPlaying,
            (rSong, user, delta, ignoreCd) => this.ratingService.rateSong(rSong, user, delta, ignoreCd)
          );
        }
      });
  }
}

module.exports = NowPlayingCommand;
