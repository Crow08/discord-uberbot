const Command = require("./Command.js");

/**
 * Class for search song command.
 * @extends Command
 * @Category Commands
 */
class SearchCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {PlayerService} playerService - PlayerService.
   * @param {QueueService} queueService - QueueService.
   * @param {SearchService} searchService - SearchService.
   */
  constructor(chatService, playerService, queueService, searchService, dbService) {
    super(
      ["search"],
      "search for a song and choose from multiple results.",
      "<prefix>search <query>\n=> \"cancel\" |\n" +
      "[\"play\"|\"add\"] <song number> |\n \"pladd\" <pl name> <song number>"
    );
    this.playerService = playerService;
    this.queueService = queueService;
    this.chatService = chatService;
    this.searchService = searchService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0) {
      this.chatService.simpleNote(msg, "No query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    this.searchService.querySearch(payload, 50).
      then(({note, songs}) => {
        const eSongs = songs.map((song) => {
          song.requester = msg.author.username;
          return song;
        });
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC).
          then((infoMsg) => infoMsg.delete({"timeout": 5000}));

        const pages = [];
        let curPage = "";
        eSongs.forEach((entry, index) => {
          curPage += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
          if ((index + 1) % 10 === 0) {
            curPage += `Page ${pages.length + 1} / ${Math.ceil(eSongs.length / 10)}`;
            const embed = new this.chatService.DiscordMessageEmbed();
            embed.setTitle("search results:");
            embed.setColor(48769);
            embed.setDescription(curPage);
            pages.push(embed);
            curPage = "";
          }
        });
        if (eSongs.length % 10 !== 0) {
          curPage += `Page ${pages.length + 1} / ${Math.ceil(eSongs.length / 10)}`;
          const embed = new this.chatService.DiscordMessageEmbed();
          embed.setTitle("search results:");
          embed.setColor(48769);
          embed.setDescription(curPage);
          pages.push(embed);
        }
        if (pages.length === 0) {
          this.chatService.simpleNote(msg, "No search results!", this.chatService.msgType.INFO);
        } else {
          this.chatService.pagedContent(msg, pages).
            then((pagedMsg) => this.chatService.awaitCommand(
              msg, (resp) => this.isSelectionCmd(resp), (col) => this.processSelectionCmd(col, eSongs),
              () => {
                pagedMsg.delete();
              }
            ));
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }

  /**
   * Filter for incoming messages for await command.
   * @private
   * @param {Message} resp Collected User responses.
   */
  isSelectionCmd(resp) {
    const message = resp.content.trim().toLowerCase();
    if ((!isNaN(message) && message.length > 0) || message === "cancel") {
      return true;
    }
    const cmd = message.split(" ")[0];
    if ((message.split(" ").length === 2 && ["a", "add", "p", "play"].includes(cmd) && !isNaN(message.split(" ")[1])) ||
        (message.split(" ").length === 3 && ["pla", "pladd"].includes(cmd) && !isNaN(message.split(" ")[2]))) {
      return true;
    }
    return false;
  }

  /**
   * Process followup command for user selection by adding or playing the song.
   * @private
   * @param {Message[]} collected Collected User responses in this case always a single element.
   * @param {*} songs songs in the selection.
   */
  processSelectionCmd(collected, songs) {
    const response = collected.array()[0];
    const content = response.content.trim().toLowerCase();
    if (!isNaN(content)) {
      this.playerService.playNow(songs[content - 1], response);
    } else if (content === "cancel") {
      this.chatService.simpleNote(response, "Selection canceled!", this.chatService.msgType.MUSIC);
    } else {
      const cmd = content.split(" ")[0];
      let song = null;
      let plName = null;
      if (content.split(" ").length === 2) {
        song = songs[content.split(" ")[1] - 1];
      } else {
        plName = content.split(" ")[1];
        song = songs[content.split(" ")[2] - 1];
      }

      switch (cmd) {
      case "p":
      case "play": {
        this.playerService.playNow(song, response);
        break;
      }
      case "a":
      case "add": {
        this.queueService.addFairlyToQueue(song);
        const note = `Song added to queue: ${song.title}`;
        this.chatService.simpleNote(response, note, this.chatService.msgType.MUSIC);
        break;
      }
      case "pla":
      case "pladd": {
        this.dbService.addSong(song, plName);
        const note = `Song added ${song.title} to playlist ${plName}`;
        this.chatService.simpleNote(response, note, this.chatService.msgType.MUSIC);
        break;
      }
      default:
        break;
      }
    }
  }
}

module.exports = SearchCommand;
