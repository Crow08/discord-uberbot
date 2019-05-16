const Command = require("./Command.js");

class ListSongsCommand extends Command {
  constructor(chatService, dbService) {
    super("listsongs");
    super.help = "lists all songs of the specified playlist";
    super.usage = "<prefix>listsongs <playlist>";
    super.alias = ["listsongs", "ls"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  run(payload, msg) {
    this.dbService.getPlaylist(payload).then((songs) => {
      let count = 1;
      const embed = new this.chatService.DiscordMessageEmbed();
      let songlist = "";
      embed.setTitle(`Playlist: ${payload}`);
      embed.setColor(48769);
      songs.forEach((song) => {
        songlist += `\`\`\`${count}. ${song.title} - ${song.artist}\`\`\`\n`;
        count++;
      });
      embed.setDescription(songlist);
      this.chatService.send(msg, embed);
    });
  }
}

module.exports = ListSongsCommand;
