const Command = require("./Command.js");

class SearchCommand extends Command {
  constructor(chatService, playerService, searchService) {
    super("search");
    super.help = "Search for a song and choose from multiple results.";
    super.usage = "<prefix>search <query>";
    super.alias = ["search"];
    this.playerService = playerService;
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
      then((songs) => this.openMenu(songs, msg)).
      catch();
  }

  openMenu(songs, msg) {
    let page = 0;
    msg.channel.send(this.buildPage(songs, page)).
      then((menuMsg) => menuMsg.react("⏪").then(() => menuMsg.react("⏩").then(() => {
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
          ++page;
          menuMsg.edit(this.buildPage(songs, page));
        });
        backReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          --page;
          menuMsg.edit(this.buildPage(songs, page));
        });

        msg.channel.awaitMessages(
          (resp) => !isNaN(resp.content.trim()) || resp.content.trim() === ("cancel"),
          {"errors": ["time"], "max": 1, "time": 120000}
        ).
          then((collected) => {
            if (!isNaN(collected.array()[0].content) && collected.array()[0].content <= songs.length) {
              this.playerService.playNow(songs[collected.array()[0].content - 1], msg);
            }
            menuMsg.delete();
          }).
          catch(() => menuMsg.delete());
      })));
  }

  buildPage(songs, pageNo) {
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
