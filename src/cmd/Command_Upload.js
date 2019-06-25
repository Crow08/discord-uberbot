const Command = require("./Command.js");
const request = require("request");

/**
 * Class for upload songs file command.
 * @extends Command
 * @Category Commands
 */
class UploadCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {SearchService} searchService - SearchService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, queueService, searchService, dBService) {
    super(
      ["upload"],
      "add a songs from a file to the queue or to a playlist.",
      "<prefix>upload [<playlist name>]\n=> attach file to the message\n" +
      "txt files with a query each row or csv files with 3 columns per row <query>;<artist>;<title>"
    );
    this.chatService = chatService;
    this.dBService = dBService;
    this.searchService = searchService;
    this.queueService = queueService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof msg.attachments === "undefined" || msg.attachments.array().length === 0) {
      this.chatService.simpleNote(msg, "No attached file found!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }

    msg.attachments.array().forEach((attachment) => request(attachment.url, (err, response, body) => {
      if (err) {
        this.chatService.simpleNote(msg, new Error("Unable to download attached file!"), this.chatService.msgType.FAIL);
        return;
      }
      const lines = body.split("\n");
      if (typeof payload === "undefined" || payload.length === 0) {
        this.chatService.simpleNote(msg, "0 songs added to queue.", this.chatService.msgType.MUSIC).
          then((infoMsg) => {
            if (attachment.name.endsWith(".csv")) {
              this.addCSVRecursively(lines, msg, 0, infoMsg);
            } else {
              this.addRecursively(lines, msg, 0, infoMsg);
            }
          });
      } else {
        this.chatService.simpleNote(msg, `0 songs added to playlist: ${payload}.`, this.chatService.msgType.MUSIC).
          then((infoMsg) => {
            if (attachment.name.endsWith(".csv")) {
              this.addCSVRecursively(lines, msg, 0, infoMsg, payload);
            } else {
              this.addRecursively(lines, msg, 0, infoMsg, payload);
            }
          });
      }
    }));
  }

  /**
   * Add file using every line as query to search with.
   * @param {string[]} lines - Array of lines still to process.
   * @param {Message} msg - User message this function is invoked by.
   * @param {number} count - Number of songs already processed.
   * @param {Message} statusMsg - Message sent by the bot to display the progress of the import
   * <br>&nbsp;&nbsp;(updated every 10 songs).
   * @param {string} plName Optional playlist name if unset songs are added to queue instead.
   */
  addRecursively(lines, msg, count, statusMsg, plName) {
    if (lines.length <= 0) {
      statusMsg.edit(statusMsg.content.replace(/\d+/u, count));
      this.chatService.simpleNote(msg, "Import successful!", this.chatService.msgType.INFO);
      return;
    }
    this.searchService.search(lines.pop()).
      then(({note, songs}) => {
        console.log(note);
        const newCount = count + songs.length;
        this.processSongs(songs, msg.author.username, plName);
        for (let processed = count; processed < newCount; processed++) {
          if (processed % 10 === 0) {
            statusMsg.edit(statusMsg.content.replace(/\d+/u, newCount));
          }
        }
        this.addRecursively(lines, msg, newCount, statusMsg, plName);
      }).
      catch((error) => {
        this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL);
        this.addRecursively(lines, msg, count, statusMsg, plName);
      });
  }

  /**
   * Add .csv files with 3 columns per row <query>;<artist>;<title>
   * @param {string[]} lines - Array of lines still to process.
   * @param {Message} msg - User message this function is invoked by.
   * @param {number} count - Number of songs already processed.
   * @param {Message} statusMsg - Message sent by the bot to display the progress of the import
   * <br>&nbsp;&nbsp;(updated every 10 songs).
   * @param {string} plName Optional playlist name if unset songs are added to queue instead.
   */
  addCSVRecursively(lines, msg, count, statusMsg, plName) {
    if (lines.length <= 0) {
      statusMsg.edit(statusMsg.content.replace(/\d+/u, count));
      this.chatService.simpleNote(msg, "Import successful!", this.chatService.msgType.INFO);
      return;
    }
    const row = lines.pop().
      replace("\n", "").
      replace("\r", "").
      split(";");
    if (row.length === 3) {
      const searchQuery = row[0];
      const artist = row[1];
      const title = row[2];
      this.searchService.search(searchQuery).
        then(({note, songs}) => {
          console.log(note);
          const newCount = count + 1;
          songs[0].artist = artist;
          songs[0].title = title;
          this.processSongs([songs[0]], msg.author.username, plName);
          if (newCount % 10 === 0) {
            statusMsg.edit(statusMsg.content.replace(/\d+/u, newCount));
          }
          this.addCSVRecursively(lines, msg, newCount, statusMsg, plName);
        }).
        catch((error) => {
          this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL);
          this.addCSVRecursively(lines, msg, count, statusMsg, plName);
        });
    } else {
      const note = "Skipping row: invalid csv!\n3 columns per row <artist>;<title>;<query>";
      this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
      this.addCSVRecursively(lines, msg, count, statusMsg, plName);
    }
  }

  /**
   * Process a songs by adding requester and optional playlist fields.
   * Then add the songs to the playlist or queue.
   * @private
   * @param {Song} songs - Song to be processed.
   * @param {string} username - Requester username.
   * @param {string} plName - Optional playlist name if unset songs are added to queue instead.
   */
  processSongs(songs, username, plName) {
    const enrichedSongs = songs.map((song) => {
      song.requester = username;
      if (typeof plName === "undefined") {
        song.playlist = plName;
      }
      return song;
    });
    if (songs.length > 1) {
      if (typeof plName === "undefined") {
        this.queueService.addMultipleFairlyToQueue(enrichedSongs);
      } else {
        this.dBService.addSongs(enrichedSongs, plName);
      }
    } else if (typeof plName === "undefined") {
      this.queueService.addFairlyToQueue(songs[0]);
    } else {
      this.dBService.addSong(songs[0], plName);
    }
  }
}

module.exports = UploadCommand;
