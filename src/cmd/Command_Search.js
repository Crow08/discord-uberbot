const Command = require("./Command.js");

class SearchCommand extends Command {
  constructor(chatService, playerService, queueService, searchService) {
    super("search");
    super.help = "search for a song and choose from multiple results.";
    super.usage = "<prefix>search <query> =>[play|add] <song number>";
    super.alias = ["search"];
    this.playerService = playerService;
    this.queueService = queueService;
    this.chatService = chatService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg.channel, "No query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    this.searchService.searchMultiple(payload, 50, msg, "YT").
      then((songs) => this.chatService.openSelectionMenu(songs, msg, this.isSelectionCmd, (collected, songs) => {
        const that = this;
        console.log("000");
        const msg = collected.array()[0];
        const content = msg.content.trim();
        if (!isNaN(content)) {
          console.log("111");
          console.log(that.playerService);
          console.log("222");
          that.playerService.playNow(songs[content - 1], msg);
        } else if (content !== "cancel") {
          const cmd = content.split(" ")[0];
          const song = songs[content.split(" ")[1] - 1];
          switch (cmd) {
          case "play":
          that.playerService.playNow(song, msg);
            break;
          case "add":
          that.queueService.addToQueue(song);
          that.chatService.simpleNote(msg.channel, `song added to queue: ${song.title}`, that.chatService.msgType.MUSIC);
            break;
          default:
            break;
          }
        }
      })).
      catch((error) => this.chatService.simpleNote(msg.channel, error, this.chatService.msgType.FAIL));
  }


  isSelectionCmd(resp) {
    const message = resp.content.trim();
    if (!isNaN(message)) {
      return true;
    } else if (message === "cancel") {
      return true;
    } else if (message.split(" ").length >= 2) {
      const cmd = message.split(" ")[0];
      if (cmd === "add" || cmd === "play") {
        if (!isNaN(message.split(" ")[1])) {
          return true;
        }
      }
    }
    return false;
  }
}

module.exports = SearchCommand;
