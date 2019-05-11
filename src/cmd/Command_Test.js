const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, queueService, discord, dbService) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.queueService = queueService;
    this.discord = discord;
    this.dbService = dbService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg.channel, "No URL or query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    console.log("merging playlists:");
    const source = payload.split(" ")[0];
    const target = payload.split(" ")[1];
    console.log(source);
    console.log(target);
    let count = 0;
    source.forEach((entry) => {
      count++;
      this.dbService.addSong(entry, target).then(() => {
        console.log(`added ${entry.title} to Playlist ${target}`);
      });
    });
    this.chatService.simpleNote(msg.channel, `added ${count} Songs to ${target}`, this.chatService.msgType.INFO);
  }
}
module.exports = TestCommand;
