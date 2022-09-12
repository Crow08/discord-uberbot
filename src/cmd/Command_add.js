const {SlashCommandBuilder} = require("discord.js");
const chatService = require("../ChatService");
const queueService = require("../QueueService");
const searchService = require("../SearchService");

const run = (interaction) => {
  const songQuery = interaction.options.getString("song_query");

  searchService.search(songQuery).
    then(({
      note,
      songs
    }) => {
      chatService.simpleNote(interaction, note, chatService.msgType.MUSIC).
        then((infoMsg) => infoMsg.delete({"timeout": 5000}));
      let response = "";
      if (songs.length > 1) {
        const enrichedSongs = songs.map((song) => {
          song.requester = interaction.user.username;
          return song;
        });
        queueService.addMultipleFairlyToQueue(enrichedSongs, interaction);
        response = `${enrichedSongs.length}songs added to queue.`;
      } else {
        songs[0].requester = interaction.user.username;
        queueService.addFairlyToQueue(songs[0], interaction);
        response = `song added to queue: ${songs[0].title}`;
      }
      chatService.simpleNote(interaction, response, chatService.msgType.MUSIC, true);
    }).
    catch((error) => {
      chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true);
    });
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("add").
    setDescription("add a song to the current queue by url or query.").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("SearchTerm or URL for song").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
