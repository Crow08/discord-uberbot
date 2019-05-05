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
      this.chatService.simpleNote(msg.channel, "No URL or query found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const query = payload.substr(plName.length + 1);
    this.searchService.search(query, msg).then((song) => {
      if (Array.isArray(song)) {
        this.dBService.addSongs(song, plName);
        const count = song.length();
        const note = `${count} songs added to playlist: ${plName}`;
        this.chatService.simpleNote(msg.channel, note, this.chatService.msgType.MUSIC);
      } else {
        this.dBService.addSong(song, plName);
        const note = `added song: ${song.title} to playlist: ${plName}`;
        song.playlist = plName;
        console.log(song);
        this.chatService.simpleNote(msg.channel, note, this.chatService.msgType.MUSIC);
      }
    }).
      catch();
  }
}

module.exports = AddPLCommand;
