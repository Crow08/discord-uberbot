const Command = require("./Command.js");

const isSelectionCmd = function isSelectionCmd(resp) {
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

const processSelectionCmd = function processSelectionCmd(collected, songs, playerService, queueService, chatService) {
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

class SearchCommand extends Command {
  constructor(chatService, playerService, queueService, searchService) {
    super("search");
    super.help = "search for a song and choose from multiple results.";
    super.usage = "<prefix>search <query>\n=>[play|add] <song number>";
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
      then((songs) => this.chatService.openSelectionMenu(
        songs, msg, isSelectionCmd,
        (collected) => processSelectionCmd(collected, songs, this.playerService, this.queueService, this.chatService)
      )).
      catch((error) => this.chatService.simpleNote(msg.channel, error, this.chatService.msgType.FAIL));
  }
}

module.exports = SearchCommand;
