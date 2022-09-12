const chatService = require("../ChatService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  playerService.skip(interaction);
  chatService.simpleNote(interaction, "Song skipped!", chatService.msgType.MUSIC, true);
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("skip").
    setDescription("Skip current song."),
  async execute(interaction) {
    await run(interaction);
  }
};
