/** Abstract Class representing a Command. */
class Command {

  /**
   * Constructor.
   * @param {String} name - unique command name.
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
   * @param {String} payload - command payload with with optional parameters dependent on the command implemntation.
   * @param {Message} msg - Discord.js message which triggered the command.
   */
  run(payload, msg) {
    console.log(`No implementation of '${this.name}'-command found.\n Arguments:`);
    console.log(payload);
    console.log(msg);
  }
}

module.exports = Command;
