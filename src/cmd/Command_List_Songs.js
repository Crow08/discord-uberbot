const Command = require("./Command.js");

class ListSongsCommand extends Command {
  constructor(chatService, discord, dbService) {
    super("listsongs");
    super.help = "lists all songs of the specified playlist";
    super.usage = "<prefix>listsongs <playlist>";
    super.alias = ["listsongs", "ls"];
    this.chatService = chatService;
    this.discord = discord;
    this.dbService = dbService;
  }

  run(payload, msg) {
    console.log("Testing...");
    this.dbService.getPlaylist(payload).then((songs) => {
      songs.forEach((song) => {
        console.log(`${song.title} - ${song.artist}`);
        this.chatService.basicNote(msg.channel, `\`\`\`${song.title} - ${song.artist}\`\`\``);
      });
    });
  }
}

module.exports = ListSongsCommand;
