const chatService = require("../ChatService");
const dbService = require("../DBService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  queueService.getCurrentSong().
    then((nowPlaying) => {
      dbService.addSong(nowPlaying, plName).
        then(() => {
          const note = `added ${nowPlaying.title} to Playlist ${plName}`;
          chatService.simpleNote(interaction, note, chatService.msgType.INFO, true);
        });
    });
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("add_song_to_pl").
    setDescription("adds current song to given playlist").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to add the song to.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
