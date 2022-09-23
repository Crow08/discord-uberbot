const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const playerService = require("../PlayerService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const volume = interaction.options.getString("volume");
  if (volume === null) {
    const note = `Volume is set to  ${voiceService.volume} right now`;
    chatService.simpleNote(interaction, note, chatService.msgType.MUSIC, true);
  } else if (volume > 200 || volume < 0) {
    const note = "A cheeky one, aren't you? Try with numbers between 0 and 200";
    chatService.simpleNote(interaction, note, chatService.msgType.FAIL, true);
  } else {
    voiceService.volume = volume;
    playerService.restart(interaction);
    chatService.simpleNote(interaction, `Set Volume to  ${volume}`, chatService.msgType.MUSIC, true);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("volume").
    setDescription("Sets volume or returns current volume").
    addIntegerOption((option) => option.
      setName("volume").
      setDescription("volume in percent (0% - 200%)").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  }
};
