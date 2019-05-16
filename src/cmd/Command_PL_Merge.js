const Command = require("./Command.js");

class MergePLCommand extends Command {
  constructor(chatService, dbService) {
    super("merge");
    super.help = "copies one playlist into another!";
    super.usage = "<prefix>merge <sourcepl> <targetpl>";
    super.alias = ["merge"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    const source = payload.split(" ")[0];
    const target = payload.split(" ")[1];
    this.dbService.mergePlaylists(source, target);
    this.chatService.send(msg, `copied playlist ${source} into playlist ${target}`);
  }
}
module.exports = MergePLCommand;
