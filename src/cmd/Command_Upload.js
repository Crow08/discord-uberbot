const Command = require("./Command.js");
const request = require("request");

class UploadCommand extends Command {
  constructor(chatService, queueService, searchService, dBService) {
    super("upload");
    super.help = "add a songs from a file to the queue or to a playlist.";
    super.usage = "<prefix>upload [<playlist name>]\n=> attach file to the message";
    super.alias = ["upload"];
    this.chatService = chatService;
    this.dBService = dBService;
    this.searchService = searchService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof msg.attachments === "undefined" || msg.attachments.array().length === 0) {
      this.chatService.simpleNote(msg, "No attached file found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

    msg.attachments.array().forEach((element) => request(element.url, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      const lines = body.split("\n");
      if (typeof payload === "undefined" || payload.length === 0) {
        this.addToQueueRecursive(lines, msg, 0);
      } else {
        this.addToPlaylistRecursive(lines, msg, payload, 0);
      }
    }));
  }

  addToQueueRecursive(lines, msg, count) {
    if (lines.length <= 0) {
      this.chatService.simpleNote(msg, `${count}songs added to queue.`, this.chatService.msgType.MUSIC);
    }
    this.searchService.search(lines.pop()).
      then(({note, songs}) => {
        console.log(note);
        let newCount = count;
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.requester = msg.author.username;
            return song;
          });
          this.queueService.addMultipleToQueue(enrichedSongs, msg);
          newCount += enrichedSongs.length();
        } else {
          songs[0].requester = msg.author.username;
          this.queueService.addToQueue(songs[0], msg);
          ++newCount;
        }
        this.addToQueueRecursive(lines, msg, newCount);
        if (newCount % 10 === 0) {
          this.chatService.simpleNote(msg, "Working on import please be patient!", this.chatService.msgType.Info);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }

  addToPlaylistRecursive(lines, msg, plName, count) {
    if (lines.length <= 0) {
      this.chatService.simpleNote(msg, `${count}songs added to queue.`, this.chatService.msgType.MUSIC);
    }
    this.searchService.search(lines.pop()).
      then(({note, songs}) => {
        console.log(note);
        let newCount = count;
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.playlist = plName;
            song.requester = msg.author.username;
            return song;
          });
          this.dBService.addSongs(enrichedSongs, plName);
          newCount += enrichedSongs.length();
        } else {
          songs[0].playlist = plName;
          songs[0].requester = msg.author.username;
          this.dBService.addSong(songs[0], plName);
          ++newCount;
        }
        this.addToPlaylistRecursive(lines, msg, plName, newCount);
        if (newCount % 10 === 0) {
          this.chatService.simpleNote(msg, "Working on import please be patient!", this.chatService.msgType.Info);
        }
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}

module.exports = UploadCommand;
