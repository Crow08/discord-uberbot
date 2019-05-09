const Command = require("./Command.js");

class ListSongsCommand extends Command {
  constructor(chatService, discord, dbService) {
    super("listsongs");
    super.help = "lists all songs of the specified playlist";
    super.usage = "<prefix>listsongs <playlist>";
    super.alias = ["listsongs", "ls"];
    this.chatService = chatService;
    this.discord = discord;
    this.dbService = dbService;
  }

  run(payload, msg) {
    console.log(`Listing songs of ${payload}:`);
    this.dbService.getPlaylist(payload).then((songs) => {
      let count = 1;
      const embed = new this.discord.RichEmbed();
      let songlist = "";
      embed.setTitle(`Playlist: ${payload}`);
      embed.setColor(48769);
      songs.forEach((song) => {
        console.log(song);
        songlist += `\`\`\`${count}. ${song.title} - ${song.artist}\`\`\`\n`;
        count++;
      });
      embed.setDescription(songlist);
      this.chatService.richNote(msg, embed);
    });
  }
}

module.exports = ListSongsCommand;
