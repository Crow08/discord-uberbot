const Command = require("./Command.js");

class ListPLCommand extends Command {
  constructor(chatService, dbService) {
    super("pllist");
    super.help = "lists available playlists";
    super.usage = "<prefix>pllist";
    super.alias = ["pllist", "l"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

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
