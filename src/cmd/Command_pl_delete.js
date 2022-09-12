const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");

  dbService.deletePlaylist(plName).
    then(() => chatService.simpleNote(interaction, `playlist deleted: ${plName}`, chatService.msgType.MUSIC, true)).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL), true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_delete").
    setDescription("deletes a playlist permanently.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("Playlist name to delete.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
