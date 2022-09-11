const chatService = require("../ChatService");
const searchService = require("../SearchService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  const songQuery = interaction.options.getString("song_query");

  searchService.search(songQuery).
    then(({
      note,
      songs
    }) => {
      chatService.simpleNote(interaction, note, chatService.msgType.MUSIC).
        then((infoMsg) => infoMsg.delete({"timeout": 5000}));
      if (songs.length > 1) {
        const enrichedSongs = songs.map((song) => {
          song.playlist = plName;
          song.requester = interaction.user.username;
          return song;
        });
        dbService.addSongs(enrichedSongs, plName).
          then(() => {
            const count = enrichedSongs.length;
            const note2 = `${count} songs added to playlist: ${plName}`;
            chatService.simpleNote(interaction, note2, chatService.msgType.MUSIC, true);
          }).
          catch((error) => {
            chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true);
          });
      } else {
        songs[0].playlist = plName;
        songs[0].requester = interaction.user.username;
        dbService.addSong(songs[0], plName).
          then(() => {
            const note2 = `added song: ${songs[0].title} to playlist: ${plName}`;
            chatService.simpleNote(interaction, note2, chatService.msgType.MUSIC, true);
          }).
          catch((error) => {
            chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true);
          });
      }
    }).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_add").
    setDescription("Add a song to the specified playlist by url or query.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to add the song to.").
      setRequired(true)).
    addStringOption((option) => option.
      setName("song_query").
      setDescription("SearchTerm or URL for song").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
