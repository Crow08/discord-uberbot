const chatService = require("../ChatService");
const queueService = require("../QueueService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");

  const message = `playlist loaded: ${plName}`;
  queueService.loadPlaylist(plName, interaction).
    then(() => {
      chatService.simpleNote(interaction, message, chatService.msgType.MUSIC);
      // Shuffle playlist
      queueService.shuffleQueue();
      chatService.simpleNote(interaction, "Queue shuffled!", chatService.msgType.MUSIC);

      // Start playing
      playerService.play(interaction);
      chatService.simpleNote(interaction, "Playlist started!", chatService.msgType.MUSIC, true);
    }).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_start").
    setDescription("Loads a playlist shuffles it and starts playing.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to load.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
