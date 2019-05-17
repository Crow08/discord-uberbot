/** Abstract Class representing a Command. */
class Command {
  constructor(name) {
    this.name = name;
    this.enabled = true;
    this.alias = [];
    this.help = "";
    this.usage = "";
  }

  run(payload, msg) {
    console.log(`No implementation of '${this.name}'-command found.\n Arguments:`);
    console.log(payload);
    console.log(msg);
  }
}

module.exports = Command;
