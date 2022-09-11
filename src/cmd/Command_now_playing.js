const chatService = require("../ChatService");
const queueService = require("../QueueService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const run = (interaction) => {
  queueService.getCurrentSong().
    then((nowPlaying) => {
      if (typeof nowPlaying === "undefined") {
        chatService.simpleNote(interaction, "No Playback!", chatService.msgType.MUSIC, true);
      } else {
        chatService.simpleNote(interaction, "Loading Player:", chatService.msgType.MUSIC, true);
        playerService.rebuildPlayer(interaction);
      }
    });
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("now_playing").
    setDescription("returns the current song."),
  async execute(interaction) {
    await run(interaction);
  }
};
