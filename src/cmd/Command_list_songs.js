const chatService = require("../ChatService");
const dbService = require("../DBService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");

  const addPage = (listText, pages, songs) => {
    listText += `Page ${pages.length + 1} / ${Math.ceil(songs.length / 10)}`;
    const embed = new EmbedBuilder();
    embed.setTitle(`Playlist: ${plName}`);
    embed.setColor(48769);
    embed.setDescription(listText);
    pages.push(embed);
    return listText;
  };

  dbService.getPlaylist(plName).
    then((songs) => {
      const pages = [];
      let listText = "";
      songs.forEach((entry, index) => {
        listText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
        if ((index + 1) % 10 === 0) {
          addPage(listText, pages, songs);
          listText = "";
        }
      });
      if (songs.length % 10 !== 0) {
        listText = addPage(listText, pages, songs);
      }
      if (pages.length === 0) {
        chatService.simpleNote(interaction, "Playlist is empty!", chatService.msgType.INFO, true);
      } else {
        chatService.simpleNote(interaction, "Listing Songs:", chatService.msgType.MUSIC, true);
        chatService.pagedContent(interaction, pages);
      }
    }).
    catch((err) => chatService.simpleNote(interaction, err, chatService.msgType.FAIL), true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("list_songs").
    setDescription("lists all songs of the specified playlist").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("auto playlist name to set. (\"unset\" to reset)").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
