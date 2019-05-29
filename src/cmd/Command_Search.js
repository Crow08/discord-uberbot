const Command = require("./Command.js");

const isSelectionCmd = (resp) => {
  const message = resp.content.trim();
  if (!isNaN(message)) {
    return true;
  } else if (message === "cancel") {
    return true;
  } else if (message.split(" ").length >= 2) {
    const cmd = message.split(" ")[0];
    if ((cmd === "add" || cmd === "play") && !isNaN(message.split(" ")[1])) {
      return true;
    }
  }
  return false;
};

const processSelectionCmd = (collected, songs, playerService, queueService, chatService) => {
  const response = collected.array()[0];
  const content = response.content.trim();
  if (!isNaN(content)) {
    playerService.playNow(songs[content - 1], response);
  } else if (content !== "cancel") {
    const cmd = content.split(" ")[0];
    const song = songs[content.split(" ")[1] - 1];
    switch (cmd) {
    case "play": {
      playerService.playNow(song, response);
      break;
    }
    case "add": {
      queueService.addToQueue(song);
      const note = `song added to queue: ${song.title}`;
      chatService.simpleNote(response.channel, note, chatService.msgType.MUSIC);
      break;
    }
    default:
      break;
    }
  }
};

/**
 * Class for search song command.
 * @extends Command
 */
class SearchCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {PlayerService} playerService - PlayerService.
   * @param {QueueService} queueService - QueueService.
   * @param {SearchService} searchService - SearchService.
   */
  constructor(chatService, playerService, queueService, searchService) {
    super("search");
    super.help = "search for a song and choose from multiple results.";
    super.usage = "<prefix>search <query>\n=>[play|add] <song number>\n=> cancel";
    super.alias = ["search"];
    this.playerService = playerService;
    this.queueService = queueService;
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
        this.chatService.openSelectionMenu(
          eSongs, msg, isSelectionCmd,
          (col) => processSelectionCmd(col, eSongs, this.playerService, this.queueService, this.chatService)
        );
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = SearchCommand;
