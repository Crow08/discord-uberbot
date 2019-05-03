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
      then((songs) => this.openSelectionMenu(songs, msg)).
      catch((error) => this.chatService.simpleNote(msg.channel, error, this.chatService.msgType.FAIL));
  }

  openSelectionMenu(songs, msg) {
    let page = 0;
    // Build choose menu.
    msg.channel.send(this.buildSelectionPage(songs, page)).
      // Add reactions for page navigation.
      then((menuMsg) => menuMsg.react("⏪").then(() => menuMsg.react("⏩").then(() => {
        // Add listeners to reactions.
        const nextReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏩" && user.id === msg.author.id,
          {"time": 120000}
        );
        const backReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏪" && user.id === msg.author.id,
          {"time": 120000}
        );
        nextReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if ((page + 1) * 10 <= songs.length) {
            ++page;
            menuMsg.edit(this.buildSelectionPage(songs, page));
          }
        });
        backReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if (page > 0) {
            --page;
            menuMsg.edit(this.buildSelectionPage(songs, page));
          }
        });
        // Add listener for response Message.
        msg.channel.awaitMessages(this.isSelectionCmd, {"errors": ["time"], "max": 1, "time": 120000}).
          then((collected) => {
            this.processSelectionCmd(collected, songs);
            menuMsg.delete();
          }).
          // Timeout or error.
          catch(() => menuMsg.delete());
      })));
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

  processSelectionCmd(collected, songs) {
    const msg = collected.array()[0];
    const content = msg.content.trim();
    if (!isNaN(content)) {
      this.playerService.playNow(songs[content - 1], msg);
    } else if (content !== "cancel") {
      const cmd = content.split(" ")[0];
      const song = songs[content.split(" ")[1] - 1];
      switch (cmd) {
      case "play":
        this.playerService.playNow(song, msg);
        break;
      case "add":
        this.queueService.addToQueue(song);
        this.chatService.simpleNote(msg.channel, `song added to queue: ${song.title}`, this.chatService.msgType.MUSIC);
        break;
      default:
        break;
      }
    }
  }

  buildSelectionPage(songs, pageNo) {
    const first = 10 * pageNo;
    const last = first + 10 > songs.length - 1 ? songs.length - 1 : first + 10;
    let page = "";
    for (let index = first; index < last; index++) {
      page += `${index + 1}. ${songs[index].title}\n`;
    }
    return page;
  }
}

module.exports = SearchCommand;
