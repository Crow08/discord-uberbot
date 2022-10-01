const chatService = require("../ChatService");
const searchService = require("../SearchService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const src = interaction.options.getString("src");
  if (src === null) {
    const {defaultSrc} = searchService;
    chatService.simpleNote(interaction, `currently preferred source is ${defaultSrc}`, chatService.msgType.MUSIC, true);
  } else {
    searchService.defaultSrc = src;
    chatService.simpleNote(interaction, `Preferred source is now ${src}`, chatService.msgType.MUSIC, true);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("preferred_src").
    setDescription("Set a source to be the default source for all searches.").
    addStringOption((option) => option.
      setName("src").
      setDescription("set content source to search from").
      addChoices(
        {
          "name": "youtube",
          "value": "YT"
        },
        {
          "name": "soundcloud",
          "value": "SC"
        },
        {
          "name": "spotify",
          "value": "SP"
        }
      ).
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "M"
};
