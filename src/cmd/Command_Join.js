const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class JoinCommand extends Command {

  /**
   * Constructor.
   * @param {BaseClient} baseClient - BaseClient.
   */
  constructor(baseClient) {
    super(
      ["join"],
      "ask bot nicely to join your channel",
      "<prefix>join"
    );
    this.baseClient = baseClient;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const channel = this.baseClient.channels.get(msg.member.voice.channel.id);
    channel.join();
  }
}
module.exports = JoinCommand;
