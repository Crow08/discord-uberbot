const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  const songQuery = interaction.options.getString("song_query");
  const songTitle = interaction.options.getString("song_title");
  const songArtist = interaction.options.getString("song_artist");
  if (songTitle === null && songArtist === null) {
    chatService.simpleNote(interaction, "please set either an new title or artist!", chatService.msgType.FAIL, true);
    return;
  }

  dbService.findSong(songQuery, plName).
    then((song) => {
      if (song === "null") {
        const note = `"${songQuery}" not found in ${plName}!`;
        chatService.simpleNote(interaction, note, chatService.msgType.FAIL, true);
      } else {
        dbService.renameSong(plName, song, songTitle, songArtist);
        const note = `renaming ${song.title} - ${song.artist} into` +
          `${songTitle === null ? song.title : songTitle} - ${songArtist === null ? song.artist : songArtist} `;
        chatService.simpleNote(interaction, note, chatService.msgType.MUSIC, true);
      }
    });
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("rename_song").
    setDescription("Rename title or artist of song.\n(first parameter \"t\" for title and \"a\" for artist.)").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("playlist to search in").
      setRequired(true)).
    addStringOption((option) => option.
      setName("song_query").
      setDescription("search term to find a song by name").
      setRequired(true)).
    addStringOption((option) => option.
      setName("song_title").
      setDescription("New song title").
      setRequired(false)).
    addStringOption((option) => option.
      setName("song_artist").
      setDescription("New song artist name").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  }
};
