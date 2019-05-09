const Command = require("./Command.js");

class ShowQueueCommand extends Command {
  constructor(chatService, queueService) {
    super("showqueue");
    super.help = "displays all songs from current queue.";
    super.usage = "<prefix>showqueue";
    super.alias = ["showqueue", "q", "queue"];
    this.chatService = chatService;
    this.queueService = queueService;
  }

  run(payload, msg) {
    console.log("displaying queue:");
    let songlist = "";
    let count = 1;
    const embed = new this.chatService.DiscordRichEmbed();
    // Get queue
    const {queue} = this.queueService;
    console.log(queue);
    // Empty variable to store output
    embed.setTitle("Queue");
    embed.setColor(48769);
    // Iterate over queue to fill songlist
    queue.forEach((entry) => {
      songlist += `\`\`\` ${count}. ${entry.title} - ${entry.artist}\`\`\`\n`;
      count++;
    });
    embed.setDescription(songlist);
    console.log(embed);
    this.chatService.richNote(msg, embed);
  }
}

module.exports = ShowQueueCommand;


/*
Song {
  title: 'Despacito',
  artist: 'Luis Fonsi',
  src: 'sc',
  requester: '',
  rating: 0,
  url: 'https://api.soundcloud.com/tracks/301157784/stream',
  srcType: { YT: 'yt', SC: 'sc', SP: 'sp' } }
Song {
  title: 'Defqwop - Heart Afire (feat. Strix) [NCS Release]',
  artist: 'NCS',
  src: 'sc',
  requester: '',
  rating: 0,
  url: 'https://api.soundcloud.com/tracks/265534576/stream',
  srcType: { YT: 'yt', SC: 'sc', SP: 'sp' } }
*/
