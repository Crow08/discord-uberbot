const Command = require("./Command.js");

class ListPLCommand extends Command {
  constructor(chatService, dbService) {
    super("pllist");
    super.help = "lists avaliable playlists";
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
      const promisses = [];
      plNames.forEach((playlist) => {
        promisses.push(this.dbService.getPlaylist(playlist));
      });

      Promise.all(promisses).then((allplSongs) => {
        allplSongs.forEach((plSongs, index) => {
          const plLength = plSongs.length;
          embed.addField(plNames[index], `${plLength} Songs`, true);
        });
        this.chatService.send(msg, embed);
      });
    });

  }
}

module.exports = ListPLCommand;
