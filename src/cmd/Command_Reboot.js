const chatService = require("../ChatService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  console.log("I´ll be back!");
  chatService.send(interaction, "I´ll be back!", true);
  setTimeout(
    () => {
      process.exit(-1);
    },
    5000
  );
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("reboot").
    setDescription("kills the bot, hopefully it will restart again"),
  async execute(interaction) {
    await run(interaction);
  }
};
