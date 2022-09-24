const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const ttsService = require("../TTSService");

const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const text = interaction.options.getString("text");
  voiceService.getVoiceConnection(interaction).
    then((voiceConnection) => {
      ttsService.announceMessage(text, voiceConnection);
    }).
    catch((err) => console.log(err));
  chatService.simpleNote(interaction, "TTS", chatService.msgType.INFO, true);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("say").
    setDescription("make the bot say dumb stuff").
    addStringOption((option) => option.
      setName("text").
      setDescription("Text to read out.").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "A"
};
