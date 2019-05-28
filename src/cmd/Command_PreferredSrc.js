const Command = require("./Command.js");

/**
 * Class for get and set the preferred music source command.
 * @extends Command
 */
class PreferredSrcCommand extends Command {
  constructor(chatService, searchService) {
    super("preferdsrc");
    super.help = "set a source to be the default source for all searches.\n" +
    "displays the current preferred source if no source is provided.\n" +
    "(valid sources are \"yt\":youtube,\"sc\":soundcloud,\"sp\":spotify.)";
    super.usage = "<prefix>preferdsrc [yt|sc|sp]";
    super.alias = ["preferdsrc", "searchsrc", "src"];
    this.chatService = chatService;
    this.searchService = searchService;
    this.sources = ["YT", "SC", "SP"];
  }

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
