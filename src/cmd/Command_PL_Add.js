const Command = require("./Command.js");

class AddPLCommand extends Command {
  constructor(chatService, dBService, searchService) {
    super("pladd");
    super.help = "add a song to the specified playlist by url or query.";
    super.usage = "<prefix>pladd <pl name> <url or query>";
    super.alias = ["pladd"];
    this.chatService = chatService;
    this.dBService = dBService;
    this.searchService = searchService;
  }

  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg, "No URL or query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const query = payload.substr(plName.length + 1);
    this.searchService.search(query, msg).then((song) => {
      if (Array.isArray(song)) {
        const songs = song.map((element) => {
          element.playlist = plName;
          return element;
        });
        this.dBService.addSongs(songs, plName);
        const count = songs.length();
        const note = `${count} songs added to playlist: ${plName}`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
      } else {
        song.playlist = plName;
        this.dBService.addSong(song, plName);
        const note = `added song: ${song.title} to playlist: ${plName}`;
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC);
      }
    }).
      catch();
  }
}

module.exports = AddPLCommand;
