const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  queueService.shuffleQueue();
  chatService.simpleNote(interaction, "Queue shuffled!", chatService.msgType.MUSIC, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("shuffle").
    setDescription("Shuffle the current queue."),
  async execute(interaction) {
    await run(interaction);
  }
};
