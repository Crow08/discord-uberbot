const chatService = require("../ChatService");
const queueService = require("../QueueService");

const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const repeatOne = interaction.options.getBoolean("repeat_one");
  if (repeatOne === true) {
    queueService.mode = "ro";
    chatService.simpleNote(interaction, "Loop current song!", chatService.msgType.MUSIC, true);
  } else if (queueService.mode === "n") {
    queueService.mode = "ra";
    chatService.simpleNote(interaction, "Loop current queue!", chatService.msgType.MUSIC, true);
  } else {
    queueService.mode = "n";
    chatService.simpleNote(interaction, "No more looping!", chatService.msgType.MUSIC, true);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("loop").
    setDescription("toggle loop mode of the queue.").
    addBooleanOption((option) => option.
      setName("repeat_one").
      setDescription("(Optional) loop current song").
      setRequired(true)),
  async execute(interaction) {
    await run(interaction);
  }
};
