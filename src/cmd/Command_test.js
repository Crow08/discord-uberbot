const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  // For testing.
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("test").
    setDescription("test").
    addStringOption((option) => option.
      setName("test").
      setDescription("test").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "G"
};
