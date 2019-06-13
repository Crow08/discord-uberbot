const Command = require("./Command.js");

/**
 * Class for list all playlists command.
 * @extends Command
 * @Category Commands
 */
class ListPLCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dbService) {
    super(
      ["pllist", "l"],
      "lists available playlists",
      "<prefix>pllist"
    );
    this.chatService = chatService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.dbService.listPlaylists().then((plNames) => {
      const embed = new this.chatService.DiscordMessageEmbed();
      embed.setColor(890629);
      embed.setTitle("Playlists:");
      const promises = [];
      const playlists = [];
      for (let index = 0; index < plNames.length; index++) {
        promises.push(this.dbService.getPlaylist(plNames[index]).
          then((playlistSongs) => playlists.push({"name": plNames[index], "songs": playlistSongs})).
          catch((err) => console.log(err)));
      }
      Promise.all(promises).then(() => {
        playlists.forEach((plSongs) => {
          const plLength = plSongs.songs.length;
          embed.addField(plSongs.name, `${plLength} Songs`, true);
        });
        this.chatService.send(msg, embed);
      });
    });

  }
}

module.exports = ListPLCommand;
