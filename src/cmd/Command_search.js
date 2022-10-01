const chatService = require("../ChatService");
const searchService = require("../SearchService");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");


const run = (interaction) => {
  const songQuery = interaction.options.getString("song_query");

  searchService.querySearch(songQuery, 50).
    then(({
      note,
      songs
    }) => {
      const eSongs = songs.map((song) => {
        song.requester = interaction.user.username;
        return song;
      });
      chatService.simpleNote(interaction, note, chatService.msgType.MUSIC).
        then((infoMsg) => setTimeout(() => infoMsg.delete(), 5000));

      const pages = [];
      let curPage = "";

      const addPage = () => {
        curPage += `Page ${pages.length + 1} / ${Math.ceil(eSongs.length / 10)}`;
        const embed = new EmbedBuilder();
        embed.setTitle("search results:");
        embed.setColor(48769);
        embed.setDescription(curPage);
        pages.push(embed);
      };

      eSongs.forEach((entry, index) => {
        curPage += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
        if ((index + 1) % 10 === 0) {
          addPage();
          curPage = "";
        }
      });
      if (eSongs.length % 10 !== 0) {
        addPage();
      }
      if (pages.length === 0) {
        chatService.simpleNote(interaction, "No search results!", chatService.msgType.INFO, true);
      } else {
        chatService.simpleNote(interaction, "Searching for song:", chatService.msgType.MUSIC, true);
        chatService.pagedContent(interaction, pages);
      }
    }).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("search").
    setDescription("Search for a song and get a list of up to 50 results.").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("SearchTerm for song").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
