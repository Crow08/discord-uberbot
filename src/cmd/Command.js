/**
 * Abstract Class representing a Command.
 * @Category Commands
 */
class Command {

  /**
   * Constructor.
   * @param {string[]} alias - Command name / aliases to address the command.
   * @param {string} help - Help text to describe command functionality.
   * @param {string} usage - Command syntax (+ followups).
   */
  constructor(alias, help = "", usage = "", enabled = true) {
    this.enabled = enabled;
    this.alias = alias;
    this.help = help;
    this.usage = usage;
  }

  /**
   * Method to run when the command gets called.
   * @abstract
   * @param {string} payload - Command payload with with optional parameters dependent on the command implementation.
   * @param {Message} msg - Discord.js message which triggered the command.
   */
  run(payload, msg) {
    console.log("No command implementation found.\n Arguments:");
    console.log(payload);
    console.log(msg);
  }
}

module.exports = Command;
