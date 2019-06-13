const Command = require("./Command.js");

/**
 * Class for search in playlist command.
 * @extends Command
 * @Category Commands
 */
class SearchPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   * @param {RatingService} ratingService - RatingService.
   */
  constructor(chatService, dbService, ratingService) {
    super(
      ["plsearch", "pls"],
      "search given song in given playlist",
      "<prefix>plsearch <pl name> <song name>"
    );
    this.chatService = chatService;
    this.dbService = dbService;
    this.ratingService = ratingService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const songName = payload.substr(plName.length + 1);
    this.dbService.findSong(songName, plName).then((song) => {
      if (song === "null") {
        const note = `"${songName}" not found in ${plName}!`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
      } else {
        const ratingFunc = (rSong, usr, delta, ignoreCd) => this.ratingService.rateSong(rSong, usr, delta, ignoreCd);
        this.chatService.displaySong(msg, song, ratingFunc);
      }
    });
  }
}
module.exports = SearchPLCommand;
