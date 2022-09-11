const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const source = interaction.options.getString("source_playlist_name");
  const target = interaction.options.getString("target_playlist_name");

  dbService.mergePlaylists(source, target);
  let note = `copied playlist ${source} into playlist ${target}`;
  chatService.simpleNote(interaction, note, chatService.msgType.MUSIC, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_merge").
    setDescription("copies one playlist into another!").
    addStringOption((option) => option.
      setName("source_playlist_name").
      setDescription("Playlist name to copy songs from.").
      setRequired(true)).
    addStringOption((option) => option.
      setName("target_playlist_name").
      setDescription("Playlist name to add songs to.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
