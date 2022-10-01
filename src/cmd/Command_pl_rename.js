const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("old_playlist_name");
  const newName = interaction.options.getString("new_playlist_name");
  dbService.renamePL(plName, newName).
    then(() => {
      chatService.simpleNote(interaction, `renamed Playlist "${plName}" to "${newName}"`,
        chatService.msgType.MUSIC, true);
    }).
    catch((err) => {
      chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true);
    });
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_rename").
    setDescription("renames given playlist").
    addStringOption((option) => option.
      setName("old_playlist_name").
      setDescription("original playlist name").
      setRequired(true)).
    addStringOption((option) => option.
      setName("new_playlist_name").
      setDescription("new playlist name").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
