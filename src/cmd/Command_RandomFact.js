const Command = require("./Command.js");
const http = require("http");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class RandomFactCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   */
  constructor(voiceService, ttsService) {
    super(
      ["randomfact", "rf"],
      "displays random fact, so useful!",
      "<prefix>randomfact"
    );
    this.ttsService = ttsService;
    this.voiceService = voiceService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const options = {
      "host": "randomfactgenerator.net",
      "path": "/"
    };
    const request = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("request:");
        const array = data.split("id='z'");
        let line = array[1].substr(0, array[1].indexOf("<br"));
        line = line.replace(">", "").replace("\"", "").
          replace("\\", "");
        this.voiceService.getVoiceConnection(msg).
          then((voiceConnection) => {
            this.ttsService.announceMessage(line, voiceConnection);
          }).
          catch((err) => console.log(err));
        msg.delete({"timeout": 10000});
      });
    });
    request.on("error", (err) => {
      console.log(err.message);
    });
    request.end();
  }
}
module.exports = RandomFactCommand;
