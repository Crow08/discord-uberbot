const chatService = require("../ChatService");
const dbService = require("../DBService");
const ratingService = require("../RatingService");
const {SlashCommandBuilder} = require("discord.js");


const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  const songQuery = interaction.options.getString("song_query");

  dbService.findSong(songQuery, plName).
    then((song) => {
      if (song === "null") {
        const note = `"${songQuery}" not found in ${plName}!`;
        chatService.simpleNote(interaction, note, chatService.msgType.FAIL, true);
      } else {
        const ratingFunc = (rSong, usr, delta, ignoreCd) => ratingService.rateSong(rSong, usr, delta, ignoreCd);
        chatService.simpleNote(interaction, "Song found:", chatService.msgType.MUSIC, true);
        chatService.updatePlayer(interaction, song, ratingFunc);
      }
    });
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_search").
    setDescription("search given song in given playlist").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("playlist to search in").
      setRequired(true)).
    addStringOption((option) => option.
      setName("song_query").
      setDescription("search term to find a song by name").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
