const {SlashCommandBuilder} = require("discord.js");
const queueService = require("../QueueService");
const dbService = require("../DBService");
const chatService = require("../ChatService");

const run = (interaction) => {
  // Get queue
  const {queue} = queueService;
  let count = 0;
  const plName = interaction.options.getString("playlist_name");
  queue.forEach((entry) => {
    count++;
    dbService.addSong(entry, plName).
      then(() => {
        console.log(`added ${entry.title} to Playlist ${plName}`);
      }).
      catch((err) => {
        chatService.simpleNote(interaction, `Error while adding song: ${entry.title} - ${entry.artist}`, chatService.msgType.Error);
        console.error(err);
      });
  });
  chatService.simpleNote(interaction, `added ${count} Songs to ${plName}`, chatService.msgType.INFO, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("add_queue_to_pl").
    setDescription("adds the current queue to given playlist.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to add the songs to.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
