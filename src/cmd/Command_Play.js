const Command = require("./Command.js");

/**
 * Class for play command.
 * @extends Command
 */
class PlayCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {PlayerService} playerService - PlayerService.
   * @param {SearchService} searchService - SearchService.
   */
  constructor(chatService, playerService, searchService) {
    super("play");
    super.help = "play a song by url or query.";
    super.usage = "<prefix>play <url or query>";
    super.alias = ["play", "p"];
    this.playerService = playerService;
    this.chatService = chatService;
    this.searchService = searchService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.playerService.play(msg);
      return;
    }
    this.searchService.search(payload).
      then(({note, songs}) => {
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC).
          then((infoMsg) => infoMsg.delete({"timeout": 5000}));
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.requester = msg.author.username;
            return song;
          });
          this.playerService.playMultipleNow(enrichedSongs, msg);
        } else {
          songs[0].requester = msg.author.username;
          this.playerService.playNow(songs[0], msg);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = PlayCommand;
