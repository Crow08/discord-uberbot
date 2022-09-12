const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const songQuery = interaction.options.getString("song_query");
  if (isNaN(songQuery)) {
    for (let index = 0; index < queueService.queue.length; index++) {
      const song = queueService.queue[index];
      if (song.title.toLowerCase().
        indexOf(songQuery.toLowerCase()) >= 0) {
        queueService.remove(index);
        const message = `${song.title} - ${song.artist} removed from the queue!`;
        chatService.simpleNote(interaction, message, chatService.msgType.MUSIC, true);
        return;
      } else if (song.artist.toLowerCase().
        indexOf(songQuery.toLowerCase()) >= 0) {
        queueService.remove(index);
        const message = `${song.title} - ${song.artist} removed from the queue!`;
        chatService.simpleNote(interaction, message, chatService.msgType.MUSIC, true);
        return;
      }
    }
    chatService.simpleNote(interaction, `${songQuery} not found`, chatService.msgType.FAIL, true);
  } else {
    const index = parseInt(songQuery, 10) - 1;
    if (index < 0 || index >= queueService.queue.length) {
      chatService.simpleNote(interaction, "Queue index out of bounds!", chatService.msgType.FAIL, true);
      return;
    }

    const song = queueService.queue[index];
    queueService.remove(index);
    const message = `${song.title} - ${song.artist} removed from the queue!`;
    chatService.simpleNote(interaction, message, chatService.msgType.MUSIC, true);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("remove").
    setDescription("Removes a song from the current queue.").
    addStringOption((option) => option.
      setName("song_query").
      setDescription("can be the name of the song or the position in the queue").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
