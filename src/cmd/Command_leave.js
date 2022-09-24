const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  voiceService.disconnectVoiceConnection(interaction);
  chatService.simpleNote(interaction, "Voice disconnected!", chatService.msgType.INFO, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("leave").
    setDescription("leave the current voice channel."),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "G"
};
