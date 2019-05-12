const Command = require("./Command.js");

class AddCommand extends Command {
  constructor(chatService, queueService, searchService) {
    super("add");
    super.help = "add a song to the current queue by url or query.";
    super.usage = "<prefix>add <url or query>";
    super.alias = ["add"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "No URL or query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    this.searchService.search(payload).
      then(({note, songs}) => {
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.requester = msg.author.username;
            return song;
          });
          this.queueService.addMultipleToQueue(enrichedSongs, msg);
          const count = enrichedSongs.length();
          this.chatService.simpleNote(msg, `${count}songs added to queue.`, this.chatService.msgType.MUSIC);
        } else {
          songs[0].requester = msg.author.username;
          this.queueService.addToQueue(songs[0], msg);
          this.chatService.simpleNote(msg, `song added to queue: ${songs[0].title}`, this.chatService.msgType.MUSIC);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = AddCommand;
