const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");

  const note = `playlist loaded: ${plName}`;
  queueService.loadPlaylist(plName, interaction).
    then(() => chatService.simpleNote(interaction, note, chatService.msgType.MUSIC, true)).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_load").
    setDescription("Load a playlist replacing the current queue.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to load.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
