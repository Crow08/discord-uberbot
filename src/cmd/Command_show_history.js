const chatService = require("../ChatService");
const queueService = require("../QueueService");
const {SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const run = (interaction) => {
  const pages = [];
  let historyText = "";
  const addPage = () => {
    historyText += `Page ${pages.length + 1} / ${Math.ceil(queueService.history.length / 10)}`;
    const embed = new EmbedBuilder();
    embed.setTitle("History");
    embed.setColor(48769);
    embed.setDescription(historyText);
    pages.push(embed);
  };
  queueService.history.forEach((entry, index) => {
    historyText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;

    if ((index + 1) % 10 === 0) {
      addPage();
      historyText = "";
    }
  });
  if (queueService.history.length % 10 !== 0) {
    addPage();
  }
  if (pages.length === 0) {
    chatService.simpleNote(interaction, "History is empty!", chatService.msgType.INFO, true);
  } else {
    chatService.simpleNote(interaction, `Current history:`, chatService.msgType.MUSIC, true);
    chatService.pagedContent(interaction, pages);
  }
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("show_history").
    setDescription("displays all songs from playback history."),
  async execute(interaction) {
    await run(interaction);
  }
};
