const chatService = require("../ChatService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const seconds = interaction.options.getString("seconds");
  playerService.seek(seconds, interaction);
  chatService.simpleNote(interaction, `skipping to ${seconds} seconds.`, chatService.msgType.MUSIC, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("seek").
    setDescription("seek playback position.").
    addIntegerOption((option) => option.
      setName("seconds").
      setDescription("Second at which the playback should resume.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
