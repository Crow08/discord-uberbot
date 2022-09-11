const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

/**
 * Move the given song by index to the top of the queue to play next.
 * @param {number} songNumber - index in the queue of song to move.
 */
const prioritizeSong = (songNumber) => {
  let message = "";
  if (queueService.queue.length === 0) {
    message = "Queue is empty!";
  } else if (songNumber >= queueService.queue.length || songNumber <= 0) {
    message = "Queue index out of bounds";
  } else if (songNumber === 0) {
    message = `${queueService.queue[0].title} is already on top of the queue`;
  } else {
    queueService.queue.splice(0, 0, queueService.queue.splice(songNumber, 1)[0]);
    message = `Next up: ${queueService.queue[0].title} - ${queueService.queue[0].artist}`;
  }
  return (message);
};

const run = (interaction) => {
  const songQuery = interaction.options.getString("song_query");

  if (isNaN(songQuery)) {
    for (let count = 0; count < queueService.queue.length; count++) {
      if (queueService.queue[count].title.toLowerCase().
        indexOf(songQuery.toLowerCase()) >= 0) {
        chatService.simpleNote(interaction, prioritizeSong(count), chatService.msgType.MUSIC, true);
        return;
      } else if (queueService.queue[count].artist.toLowerCase().
        indexOf(songQuery.toLowerCase()) >= 0) {
        chatService.simpleNote(interaction, prioritizeSong(count), chatService.msgType.MUSIC, true);
        return;
      }
    }
    chatService.simpleNote(interaction, `${songQuery} not found`, chatService.msgType.FAIL, true);
  } else {
    const index = parseInt(songQuery, 10) - 1;
    chatService.simpleNote(interaction, prioritizeSong(index), chatService.msgType.MUSIC, true);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("play_next").
    setDescription("Move a song to the top of the queue").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("can be the name of the song or the position in the queue").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
