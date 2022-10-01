const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const run = (interaction) => {
  dbService.listPlaylists().
    then((plNames) => {
      const embed = new EmbedBuilder();
      embed.setColor(890629);
      embed.setTitle("Playlists:");
      const promises = [];
      const playlists = [];
      for (let index = 0; index < plNames.length; index++) {
        promises.push(dbService.getPlaylist(plNames[index]).
          then((playlistSongs) => playlists.push({
            "name": plNames[index],
            "songs": playlistSongs
          })).
          catch((err) => console.log(err)));
      }
      Promise.all(promises).
        then(() => {
          chatService.simpleNote(interaction, "Listing Palylists:", chatService.msgType.MUSIC, true);
          playlists.forEach((plSongs) => {
            const plLength = plSongs.songs.length;
            embed.addFields({"inline": true, "name": plSongs.name, "value":`${plLength} Songs`});
          });
          chatService.send(interaction, embed);
        });
    });
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pl_list").
    setDescription("lists available playlists"),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
