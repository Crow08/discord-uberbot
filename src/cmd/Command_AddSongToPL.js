const Command = require("./Command.js");

/**
 * Class for add the current song to playlist command.
 * @extends Command
 * @Category Commands
 */
class AddSongToPlCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {DbService} dbService - dbService.
   */
  constructor(chatService, queueService, dbService) {
    super("addsongtopl");
    super.help = "adds current song to given playlist";
    super.usage = "<prefix>addsongtopl <playlist>";
    super.alias = ["addsongtopl", "as2pl", "as2p"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
    }
    this.queueService.getCurrentSong().then((nowPlaying) => {
      this.dbService.addSong(nowPlaying, payload).then(() => {
        const note = `added ${nowPlaying.title} to Playlist ${payload}`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.INFO);
      });
    });

  }
}

module.exports = AddSongToPlCommand;
