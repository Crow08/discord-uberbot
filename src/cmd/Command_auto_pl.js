const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const plName = interaction.options.getString("playlist_name");
  if (plName === null) {
    // Get auto playlist.
    queueService.getAutoPL().
      then((autoPl) => {
        chatService.simpleNote(interaction, `Current auto playlist: ${autoPl}`, chatService.msgType.INFO, true);
      }).
      catch((err) => {
        chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true);
      });
  } else if (plName === "unset") {
    // Unset auto playlist.
    queueService.unsetAutoPL();
    chatService.simpleNote(interaction, "Auto playlist unset.", chatService.msgType.MUSIC, true);
  } else {
    // Set auto playlist.
    const note = `Auto playlist set to: ${plName}`;
    queueService.setAutoPL(plName).
      then(() => chatService.simpleNote(interaction, note, chatService.msgType.MUSIC, true)).
      catch((err) => chatService.simpleNote(interaction, err, chatService.msgType.FAIL, true));
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("auto_pl").
    setDescription("get or set a playlist name to be the auto playlist.").
    addStringOption((option) => option.
      setName("playlist_name").
      setDescription("auto playlist name to set. (\"unset\" to reset)").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  }
};
