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
   * @param {PlayerService} playerService - PlayerService.
   */
  constructor(chatService, queueService, playerService) {
    super(
      ["nowplaying", "np"],
      "returns first song in history (current song)",
      "<prefix>nowplaying"
    );
    this.chatService = chatService;
    this.queueService = queueService;
    this.playerService = playerService;
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
          this.playerService.rebuildPlayer(msg);
        }
      });
  }
}

module.exports = NowPlayingCommand;
