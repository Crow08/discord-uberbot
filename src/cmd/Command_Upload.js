const Command = require("./Command.js");
const request = require("request");

class UploadCommand extends Command {
  constructor(chatService, queueService, searchService, dBService) {
    super("upload");
    super.help = "add a songs from a file to the queue or to a playlist.";
    super.usage = "<prefix>upload [<playlist name>] => attach file to the message";
    super.alias = ["upload"];
    this.chatService = chatService;
    this.dBService = dBService;
    this.searchService = searchService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    if (typeof msg.attachments === "undefined" || msg.attachments.array().length === 0) {
      this.chatService.simpleNote(msg.channel, "No attached file found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg.channel, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

    msg.attachments.array().forEach((element) => request(element.url, (err, response, body) => {
      if (err) {
        console.log(err);
      }
      const lines = body.split("\n");
      if (typeof payload === "undefined" || payload.length === 0) {
        this.addToQueue(lines, msg);
      } else {
        this.addToPlaylist(lines, msg, payload);
      }
    }));
  }

  addToQueue(lines, msg) {
    const promisses = [];
    lines.forEach((line) => {
      promisses.push(this.searchService.search(line, msg));
    });
    Promise.all(promisses).then((allSongs) => {
      let count = 0;
      allSongs.forEach((song) => {
        if (Array.isArray(song)) {
          this.queueService.addMultipleToQueue(song, msg);
          count += song.length();
        } else {
          this.queueService.addToQueue(song, msg);
          ++count;
        }
      });
      this.chatService.simpleNote(msg.channel, `${count}songs added to queue.`, this.chatService.msgType.MUSIC);
    }).
      catch();
  }

  addToPlaylist(lines, msg, payload) {
    const plName = payload;
    const promisses = [];
    lines.forEach((line) => {
      promisses.push(this.searchService.search(line, msg));
    });
    Promise.all(promisses).then((allSongs) => {
      let count = 0;
      allSongs.forEach((song) => {
        if (Array.isArray(song)) {
          const songs = song.map((element) => {
            element.playlist = plName;
            return element;
          });
          this.dBService.addSongs(songs, plName);
          count += songs.length();
        } else {
          song.playlist = plName;
          this.dBService.addSong(song, plName);
          ++count;
        }
      });
      const note = `${count} songs added to playlist: ${plName}`;
      this.chatService.simpleNote(msg.channel, note, this.chatService.msgType.MUSIC);
    }).
      catch();
  }
}

module.exports = UploadCommand;
