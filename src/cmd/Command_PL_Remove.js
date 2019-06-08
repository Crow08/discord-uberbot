const Command = require("./Command.js");

/**
 * Class for remove from playlist command.
 * @extends Command
 * @Category Commands
 */
class RemovePLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dbService) {
    super("plremove");
    super.help = "remove given song from given playlist";
    super.usage = "<prefix>plremove <pl name> <song name>";
    super.alias = ["plremove", "plrm"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.chatService.simpleNote(msg, "Wrong syntax!", this.chatService.msgType.FAIL);
      this.chatService.simpleNote(msg, `Usage: ${this.usage}`, this.chatService.msgType.INFO);
      return;
    }
    const plName = payload.split(" ")[0];
    const songQuery = payload.substr(plName.length + 1).trim();

    if (isNaN(songQuery)) {
      this.dbService.findSong(songQuery, plName).
        then((song) => {
          if (song === null) {
            const note = `Song with title: ${songQuery} not found in ${plName}!`;
            this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
            return;
          }
          this.handleRemove(song, plName, msg);
        }).
        catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
    } else {
      this.dbService.getPlaylist(plName).
        then((songs) => {
          if (songQuery < 1 || songQuery > songs.length) {
            this.chatService.simpleNote(msg, "Invalid song number!", this.chatService.msgType.FAIL);
            return;
          }
          this.handleRemove(songs[songQuery - 1], plName, msg);
        }).
        catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
    }
  }

  /**
   * Remove the song by from the playlist and notify the user.
   * @private
   * @param {Song} song - song to be removed.
   * @param {string} plName - playlist name to remove the song from.
   * @param {Message} msg - User message this function is invoked by.
   */
  handleRemove(song, plName, msg) {
    this.dbService.removeSong(song, plName).
      then((info) => {
        if (info.deletedCount === 0) {
          const note = "Something went wrong deleting the song!";
          this.chatService.simpleNote(msg, note, this.chatService.msgType.FAIL);
        } else {
          this.chatService.simpleNote(msg, `"${song.title}" removed from ${plName}!`, this.chatService.msgType.INFO);
        }
      }).
      catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
  }
}
module.exports = RemovePLCommand;
