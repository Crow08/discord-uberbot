const chatService = require("../ChatService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");


const run = (interaction) => {
  playerService.pause(interaction);
  chatService.simpleNote(interaction, "Playback paused!", chatService.msgType.INFO, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("pause").
    setDescription("pause playback."),
  async execute(interaction) {
    await run(interaction);
  }
};
