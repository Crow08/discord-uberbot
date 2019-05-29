/**
 * Abstract Class representing a Command.
 * @Category Commands
 */
class Command {

  /**
   * Constructor.
   * @param {string} name - unique command name.
   */
  constructor(name) {
    this.name = name;
    this.enabled = true;
    this.alias = [];
    this.help = "";
    this.usage = "";
  }

  /**
   * @abstract
   * @param {string} payload - Command payload with with optional parameters dependent on the command implemntation.
   * @param {Message} msg - Discord.js message which triggered the command.
   */
  run(payload, msg) {
    console.log(`No implementation of '${this.name}'-command found.\n Arguments:`);
    console.log(payload);
    console.log(msg);
  }
}

module.exports = Command;
