const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  queueService.clearQueue();
  chatService.simpleNote(interaction, "Queue is now empty!", chatService.msgType.MUSIC, true);
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("clear").
    setDescription("Clear the current queue."),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
