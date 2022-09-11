const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const run = (interaction) => {
  const pages = [];
  let queueText = "";
  const addPage = () => {
    queueText += `Page ${pages.length + 1} / ${Math.ceil(queueService.queue.length / 10)}`;
    const embed = new EmbedBuilder();
    embed.setTitle("Queue");
    embed.setColor(48769);
    embed.setDescription(queueText);
    pages.push(embed);
  };
  queueService.queue.forEach((entry, index) => {
    queueText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
    if ((index + 1) % 10 === 0) {
      addPage();
      queueText = "";
    }
  });
  if (queueService.queue.length % 10 !== 0) {
    addPage();
  }
  if (pages.length === 0) {
    chatService.simpleNote(interaction, "Queue is empty!", chatService.msgType.INFO, true);
  } else {
    chatService.simpleNote(interaction, `Current queue:`, chatService.msgType.MUSIC, true);
    chatService.pagedContent(interaction, pages);
  }
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("show_queue").
    setDescription("displays all songs from current queue."),
  async execute(interaction) {
    await run(interaction);
  }
};
