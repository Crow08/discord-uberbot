const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const streamSourceService = require("../StreamSourceService");
const searchService = require("../SearchService");
const dbService = require("../DBService");
const queueService = require("../QueueService");
const ratingService = require("../RatingService");
const playerService = require("../PlayerService");
const ttsService = require("../TTSService");
const request = require("request");
const {SlashCommandBuilder} = require("discord.js");

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
    chatService = chatService;
    dbService = dBService;
    searchService = searchService;
    queueService = queueService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  const run = (interaction) => {
    if (typeof msg.attachments === "undefined" || msg.attachments.array().length === 0) {
      chatService.simpleNote(msg, "No attached file found!", chatService.msgType.FAIL);
      chatService.simpleNote(msg, `Usage: ${this.usage}`, chatService.msgType.INFO);
      return;
    }

    msg.attachments.array().forEach((attachment) => request(attachment.url, (err, response, body) => {
      if (err) {
        chatService.simpleNote(msg, new Error("Unable to download attached file!"), chatService.msgType.FAIL);
        return;
      }
      const lines = body.split("\n");
      if (typeof payload === "undefined" || payload.length === 0) {
        chatService.simpleNote(msg, "0 songs added to queue.", chatService.msgType.MUSIC).
          then((infoMsg) => {
            if (attachment.name.endsWith(".csv")) {
              this.addCSVRecursively(lines, msg, 0, infoMsg);
            } else {
              this.addRecursively(lines, msg, 0, infoMsg);
            }
          });
      } else {
        chatService.simpleNote(msg, `0 songs added to playlist: ${payload}.`, chatService.msgType.MUSIC).
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
      chatService.simpleNote(msg, "Done, still hungry!", chatService.msgType.INFO);
      return;
    }
    searchService.search(lines.pop()).
      then(({note, songs}) => {
        console.log(note);
        const newCount = count + songs.length;
        this.processSongs(songs, msg.user.username, plName);
        for (let processed = count; processed < newCount; processed++) {
          if (processed % 10 === 0) {
            statusMsg.edit(statusMsg.content.replace(/\d+/u, newCount));
          }
        }
        this.addRecursively(lines, msg, newCount, statusMsg, plName);
      }).
      catch((error) => {
        chatService.simpleNote(msg, error, chatService.msgType.FAIL);
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
      chatService.simpleNote(msg, "Done, still hungry!", chatService.msgType.INFO);
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
      searchService.search(searchQuery).
        then(({note, songs}) => {
          console.log(note);
          const newCount = count + 1;
          songs[0].artist = artist;
          songs[0].title = title;
          this.processSongs([songs[0]], msg.user.username, plName);
          if (newCount % 10 === 0) {
            statusMsg.edit(statusMsg.content.replace(/\d+/u, newCount));
          }
          this.addCSVRecursively(lines, msg, newCount, statusMsg, plName);
        }).
        catch((error) => {
          chatService.simpleNote(msg, error, chatService.msgType.FAIL);
          this.addCSVRecursively(lines, msg, count, statusMsg, plName);
        });
    } else {
      const note = `Skipping row: invalid csv!\n3 columns per row <query>;<artist>;<title>\nfound ${row.length} columns`;
      chatService.simpleNote(msg, note, chatService.msgType.FAIL);
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
        queueService.addMultipleFairlyToQueue(enrichedSongs);
      } else {
        dbService.addSongs(enrichedSongs, plName);
      }
    } else if (typeof plName === "undefined") {
      queueService.addFairlyToQueue(songs[0]);
    } else {
      dbService.addSong(songs[0], plName);
    }
  }
}

module.exports = {
  "data": new SlashCommandBuilder().
    setName("c").
    setDescription("d").
    addStringOption((option) => option.
      setName("p").
      setDescription("d").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
