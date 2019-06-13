const Command = require("./Command.js");

const filter = (res, list) => {
  if (res.content.trim().split(" ").length !== 2) {
    return false;
  }
  const cmd = res.content.trim().split(" ")[0];
  const selection = res.content.trim().split(" ")[1];
  return (list.includes(cmd) && !isNaN(selection));
};

const process = (res, commandList, msg, queueService) => {
  const cmd = res.array()[0].content.trim().split(" ")[0];
  const selection = res.array()[0].content.trim().split(" ")[1];

  const song = queueService.history[selection - 1];

  let found = false;
  commandList.forEach((command) => {
    if (!found && command.alias.includes(cmd)) {
      console.log("\x1b[33m%s\x1b[0m", `> CMD: ${cmd}\n`);
      command.run(`${song.title} ${song.artist}`, msg);
      found = true;
    }
  });
};

/**
 * Class for show history command.
 * @extends Command
 * @Category Commands
 */
class ShowHistoryCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   * @param {QueueService} queueService - QueueService.
   * @param {Command[]} commands - Bot commands.
   */
  constructor(chatService, queueService, commands) {
    super(
      ["showhistory", "h", "history"],
      "displays all songs from current history.",
      "<prefix>showhistory"
    );
    this.chatService = chatService;
    this.queueService = queueService;
    this.commands = commands;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const pages = [];
    let historyText = "";
    this.queueService.history.forEach((entry, index) => {
      historyText += `\`\`\` ${index + 1}. ${entry.title} - ${entry.artist}\`\`\`\n`;
      if ((index + 1) % 10 === 0) {
        historyText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.history.length / 10)}`;
        const embed = new this.chatService.DiscordMessageEmbed();
        embed.setTitle("History");
        embed.setColor(48769);
        embed.setDescription(historyText);
        pages.push(embed);
        historyText = "";
      }
    });
    if (this.queueService.history.length % 10 !== 0) {
      historyText += `Page ${pages.length + 1} / ${Math.ceil(this.queueService.history.length / 10)}`;
      const embed = new this.chatService.DiscordMessageEmbed();
      embed.setTitle("History");
      embed.setColor(48769);
      embed.setDescription(historyText);
      pages.push(embed);
    }
    if (pages.length === 0) {
      this.chatService.simpleNote(msg, "History is empty!", this.chatService.msgType.INFO);
    } else {
      this.chatService.pagedContent(msg, pages);

      this.chatService.awaitCommand(
        msg, (responseMsg) => filter(responseMsg, ["p", "play", "a", "add"]),
        (res) => process(res, this.commands, msg, this.queueService)
      );
    }
  }
}

module.exports = ShowHistoryCommand;
