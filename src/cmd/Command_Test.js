const Command = require("./Command.js");

class TestCommand extends Command {
  constructor(chatService, discord) {
    super("test");
    super.help = "for testing - duh!";
    super.usage = "<prefix>test";
    super.alias = ["test"];
    this.chatService = chatService;
    this.discord = discord;
  }

  run(payload, msg) {
    console.log("Testing...");
    const embed = new this.discord.RichEmbed();
    this.chatService.richNote(msg.channel, embed);
    console.log(embed);
  }
}

module.exports = TestCommand;
