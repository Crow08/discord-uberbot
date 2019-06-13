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
    super(
      ["listsongs", "ls"],
      "lists all songs of the specified playlist",
      "<prefix>listsongs <playlist>"
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
    this.dbService.getPlaylist(payload).
      then((songs) => {
        const pages = [];
        let listText = "";
        songs.forEach((entry, index) => {
          listText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
          if ((index + 1) % 10 === 0) {
            listText += `Page ${pages.length + 1} / ${Math.ceil(songs.length / 10)}`;
            const embed = new this.chatService.DiscordMessageEmbed();
            embed.setTitle(`Playlist: ${payload}`);
            embed.setColor(48769);
            embed.setDescription(listText);
            pages.push(embed);
            listText = "";
          }
        });
        if (songs.length % 10 !== 0) {
          listText += `Page ${pages.length + 1} / ${Math.ceil(songs.length / 10)}`;
          const embed = new this.chatService.DiscordMessageEmbed();
          embed.setTitle(`Playlist: ${payload}`);
          embed.setColor(48769);
          embed.setDescription(listText);
          pages.push(embed);
        }
        if (pages.length === 0) {
          this.chatService.simpleNote(msg, "Playlist is empty!", this.chatService.msgType.INFO);
        } else {
          this.chatService.pagedContent(msg, pages);
        }
      }).
      catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
  }
}

module.exports = ListSongsCommand;
