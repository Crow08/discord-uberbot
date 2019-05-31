const Command = require("./Command.js");

/**
 * Class for list playlist songs command.
 * @extends Command
 * @Category Commands
 */
class ListSongsCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {DbService} dbService - DbService.
   */
  constructor(chatService, dbService) {
    super("listsongs");
    super.help = "lists all songs of the specified playlist";
    super.usage = "<prefix>listsongs <playlist>";
    super.alias = ["listsongs", "ls"];
    this.chatService = chatService;
    this.dbService = dbService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    this.dbService.getPlaylist(payload).then((songs) => {
      let count = 1;
      const embed = new this.chatService.DiscordMessageEmbed();
      let songList = "";
      embed.setTitle(`Playlist: ${payload}`);
      embed.setColor(48769);
      songs.forEach((song) => {
        songList += `\`\`\`${count}. ${song.title} - ${song.artist}\`\`\`\n`;
        count++;
      });
      embed.setDescription(songList);
      this.chatService.send(msg, embed);
    });
  }
}

module.exports = ListSongsCommand;
