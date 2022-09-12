const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  voiceService.getVoiceConnection(interaction).
    then(() => chatService.simpleNote(interaction, "Voice connected!", chatService.msgType.INFO, true)).
    catch(() => chatService.simpleNote(interaction, "Error connecting to Voice channel!", chatService.msgType.FAIL, true));
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("join").
    setDescription("ask bot nicely to join your channel"),
  async execute(interaction) {
    await run(interaction);
  }
};
