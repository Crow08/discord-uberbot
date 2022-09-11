const chatService = require("../ChatService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  playerService.stop(interaction);
  chatService.simpleNote(interaction, "Playback stopped!", chatService.msgType.MUSIC, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("stop").
    setDescription("Stop playback."),
  async execute(interaction) {
    await run(interaction);
  }
};
