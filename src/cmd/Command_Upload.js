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
        this.chatService.simpleNote(msg, new Error("Unable to download attached file!"), this.chatService.msgType.FAIL);
        return;
      }
      const lines = body.split("\n");
      if (typeof payload === "undefined" || payload.length === 0) {
        this.chatService.simpleNote(msg, "0 songs added to queue.", this.chatService.msgType.MUSIC).
          then((infoMsg) => this.addRecursively(lines, msg, 0, infoMsg));
      } else {
        this.chatService.simpleNote(msg, `0 songs added to playlist: ${payload}.`, this.chatService.msgType.MUSIC).
          then((infoMsg) => this.addRecursively(lines, msg, 0, infoMsg, payload));
      }
    }));
  }

  addRecursively(lines, msg, count, statusMsg, plName) {
    if (lines.length <= 0) {
      statusMsg.edit(statusMsg.content.replace(/\d+/u, count));
      this.chatService.simpleNote(msg, "Import successful!", this.chatService.msgType.INFO);
      return;
    }
    this.searchService.search(lines.pop()).
      then(({note, songs}) => {
        console.log(note);
        let newCount = count;
        if (songs.length > 1) {
          const enrichedSongs = songs.map((song) => {
            song.requester = msg.author.username;
            if (typeof plName === "undefined") {
              song.playlist = plName;
            }
            return song;
          });
          if (typeof plName === "undefined") {
            this.dBService.addSongs(enrichedSongs, plName);
          } else {
            this.queueService.addMultipleToQueue(enrichedSongs);
          }
          newCount += enrichedSongs.length();
        } else {
          songs[0].requester = msg.author.username;
          if (typeof plName === "undefined") {
            songs[0].playlist = plName;
            this.dBService.addSong(songs[0], plName);
          } else {
            this.queueService.addToQueue(songs[0], msg);
          }
          ++newCount;
        }
        this.addRecursively(lines, msg, newCount, statusMsg, plName);
        if (newCount % 10 === 0) {
          statusMsg.edit(statusMsg.content.replace(/\d+/u, newCount));
        }
      }).
      catch((error) => {
        this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL);
        this.addRecursively(lines, msg, count, statusMsg, plName);
      });
  }
}

module.exports = UploadCommand;
