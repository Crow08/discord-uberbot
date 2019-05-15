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
    this.searchService.search(query).
      then(({note, songs}) => {
        this.chatService.simpleNote(msg, note, this.chatService.msgType.MUSIC).
          then((infoMsg) => infoMsg.delete({"timeout": 5000}));
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.playlist = plName;
            song.requester = msg.author.username;
            return song;
          });
          this.dBService.addSongs(enrichedSongs, plName);
          const count = enrichedSongs.length();
          const note2 = `${count} songs added to playlist: ${plName}`;
          this.chatService.simpleNote(msg, note2, this.chatService.msgType.MUSIC);
        } else {
          songs[0].playlist = plName;
          songs[0].requester = msg.author.username;
          this.dBService.addSong(songs[0], plName);
          const note2 = `added song: ${songs[0].title} to playlist: ${plName}`;
          this.chatService.simpleNote(msg, note2, this.chatService.msgType.MUSIC);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = AddPLCommand;
