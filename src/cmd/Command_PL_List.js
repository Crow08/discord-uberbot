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
      plNames.forEach((playlist) => {
        promises.push(this.dbService.getPlaylist(playlist));
      });

      Promise.all(promises).then((allPlSongs) => {
        allPlSongs.forEach((plSongs, index) => {
          const plLength = plSongs.length;
          embed.addField(plNames[index], `${plLength} Songs`, true);
        });
        this.chatService.send(msg, embed);
      });
    });

  }
}

module.exports = ListPLCommand;
