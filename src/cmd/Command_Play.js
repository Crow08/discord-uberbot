const chatService = require("../ChatService");
const searchService = require("../SearchService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const songQuery = interaction.options.getString("song_query");
  if (songQuery === null) {
    playerService.play(interaction);
    return;
  }
  searchService.search(songQuery).
    then(({
      note,
      songs
    }) => {
      chatService.simpleNote(interaction, note, chatService.msgType.MUSIC,);
      if (songs.length > 1) {
        const enrichedSongs = songs.map((song) => {
          song.requester = interaction.user.username;
          return song;
        });
        playerService.playMultipleNow(enrichedSongs, interaction);
      } else {
        songs[0].requester = interaction.user.username;
        playerService.playNow(songs[0], interaction);
      }
      chatService.simpleNote(interaction, "Playback started!", chatService.msgType.MUSIC, true);
    }).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("play").
    setDescription("resume the current queue or olay a new song.").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("SearchTerm or URL for song").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  }
};
