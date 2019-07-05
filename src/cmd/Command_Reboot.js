const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class RebootCommand extends Command {

  /**
 *
 * @param {ChatService} chatService
 */
  constructor(chatService) {
    super(
      ["reboot"],
      "kills the bot, hopefully it will restart again",
      "<prefix>reboot"
    );
    this.chatService = chatService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    console.log("committing Sudoku");
    this.chatService.send(msg, "I´ll be back!");
    setTimeout(
      () => {
        process.exit(1337);
      },
      5000
    );
  }
}
module.exports = RebootCommand;
