const Command = require("./Command.js");

/**
 * Class for get and set the preferred music source command.
 * @extends Command
 * @Category Commands
 */
class PreferredSrcCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {SearchService} searchService - SearchService.
   */
  constructor(chatService, searchService) {
    super(
      ["preferdsrc", "searchsrc", "src"],
      "set a source to be the default source for all searches.\n" +
      "(valid sources to set are: \"yt\":youtube,\"sc\":soundcloud,\"sp\":spotify.\n" +
      "no parameter to get current source)",
      "<prefix>preferdsrc [yt|sc|sp]"
    );
    this.chatService = chatService;
    this.searchService = searchService;
    this.sources = ["YT", "SC", "SP"];
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      const {defaultSrc} = this.searchService;
      this.chatService.simpleNote(msg, `currently preferred source is ${defaultSrc}`, this.chatService.msgType.MUSIC);
    } else if (this.sources.includes(payload.toUpperCase())) {
      this.searchService.defaultSrc = payload;
      this.chatService.simpleNote(msg, `Preferred source is now ${payload}`, this.chatService.msgType.MUSIC);
    } else {
      this.chatService.simpleNote(msg, "Invalid source!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
    }
  }
}

module.exports = PreferredSrcCommand;
