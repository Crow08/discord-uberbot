const Command = require("./Command.js");

class RenamePLCommand extends Command {
  constructor(chatService, dbService) {
    super("rename");
    super.help = "renames given playlist";
    super.usage = "<prefix>rename <playlist> <newName>";
    super.alias = ["rename"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    const plName = payload.split(" ")[0];
    const newName = payload.split(" ")[1];
    this.dbService.renamePL(plName, newName).then(() => {
      this.chatService.send(msg, `renamed Playlist "${plName}" to "${newName}"`);
    }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
      });
  }
}
module.exports = RenamePLCommand;
