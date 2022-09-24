// TODO: Probably doesn't work anymore
const chatService = require("../ChatService");
const searchService = require("../SearchService");
const dbService = require("../DBService");
const queueService = require("../QueueService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

/**
 * Filter for incoming messages for await command.
 * @private
 * @param {Message} resp Collected User responses.
 */
const isSelectionCmd = (resp) => {
  const message = resp.content.trim().
    toLowerCase();
  if ((!isNaN(message) && message.length > 0) || message === "cancel") {
    return true;
  }
  const cmd = message.split(" ")[0];
  if ((message.split(" ").length === 2 && ["a", "add", "p", "play"].includes(cmd) && !isNaN(message.split(" ")[1])) ||
    (message.split(" ").length === 3 && ["pla", "pladd"].includes(cmd) && !isNaN(message.split(" ")[2]))) {
    return true;
  }
  return false;
};

/**
 * Process followup command for user selection by adding or playing the song.
 * @private
 * @param {Message[]} collected Collected User responses in this case always a single element.
 * @param {*} songs songs in the selection.
 */
const processSelectionCmd = (collected, songs) => {
  const response = collected.array()[0];
  const content = response.content.trim().
    toLowerCase();
  if (!isNaN(content)) {
    playerService.playNow(songs[content - 1], response);
  } else if (content === "cancel") {
    chatService.simpleNote(response, "Selection canceled!", chatService.msgType.MUSIC);
  } else {
    const cmd = content.split(" ")[0];
    let song = null;
    let plName = null;
    if (content.split(" ").length === 2) {
      song = songs[content.split(" ")[1] - 1];
    } else {
      plName = content.split(" ")[1];
      song = songs[content.split(" ")[2] - 1];
    }

    switch (cmd) {
    case "p":
    case "play": {
      playerService.playNow(song, response);
      break;
    }
    case "a":
    case "add": {
      queueService.addFairlyToQueue(song);
      const note = `Song added to queue: ${song.title}`;
      chatService.simpleNote(response, note, chatService.msgType.MUSIC);
      break;
    }
    case "pla":
    case "pladd": {
      dbService.addSong(song, plName);
      const note = `Song added ${song.title} to playlist ${plName}`;
      chatService.simpleNote(response, note, chatService.msgType.MUSIC);
      break;
    }
    default:
      break;
    }
  }
};

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
        chatService.pagedContent(interaction, pages).
          then((pagedMsg) => chatService.awaitCommand(
            interaction, (resp) => isSelectionCmd(resp), (col) => processSelectionCmd(col, eSongs),
            () => {
              pagedMsg.delete();
            }
          ));
      }
    }).
    catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL, true));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("search").
    setDescription("Search for a song and choose from multiple results.").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("SearchTerm for song").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
