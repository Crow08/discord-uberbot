const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

/**
 * Remove the song by from the playlist and notify the user.
 * @private
 * @param {Song} song - song to be removed.
 * @param {string} plName - playlist name to remove the song from.
 * @param {Message} msg - User message this function is invoked by.
 */
const handleRemove = (song, plName, interaction) => {
  dbService.removeSong(song, plName).
    then((info) => {
      if (info.deletedCount === 0) {
        const note = "Something went wrong deleting the song!";
        chatService.simpleNote(interaction, note, chatService.msgType.FAIL, true);
      } else {
        chatService.simpleNote(interaction, `"${song.title}" removed from ${plName}!`, chatService.msgType.INFO, true);
      }
    }).
    catch((err) => chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true));
};

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  const songQuery = interaction.options.getString("song_query");

  if (isNaN(songQuery)) {
    dbService.findSong(songQuery, plName).
      then((song) => {
        if (song === null) {
          const note = `Song with title: ${songQuery} not found in ${plName}!`;
          chatService.simpleNote(interaction, note, chatService.msgType.FAIL, true);
          return;
        }
        handleRemove(song, plName, interaction);
      }).
      catch((err) => chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true));
  } else {
    dbService.getPlaylist(plName).
      then((songs) => {
        if (songQuery < 1 || songQuery > songs.length) {
          chatService.simpleNote(interaction, "Invalid song number!", chatService.msgType.FAIL, true);
          return;
        }
        handleRemove(songs[songQuery - 1], plName, interaction);
      }).
      catch((err) => chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true));
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_remove").
    setDescription("remove given song from given playlist").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("playlist to remove a song from").
      setRequired(true)).
    addStringOption((option) => option.
      setName("song_query").
      setDescription("can be the name of the song or the position in the playlist").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
