const Command = require("./Command.js");
const http = require("http");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class PickupLineCommand extends Command {

  /**
   * Constructor.
   * @param {ChatService} chatService - ChatService.
   */
  constructor(voiceService, ttsService) {
    super(
      ["pickupline", "pl"],
      "provides you with a pickupline",
      "<prefix>pickupline"
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
    if (payload === "") {
      const random = Math.floor(Math.random() * 1327);
      const path = `/pickuplines/random/pickupline${random}.html`;
      const options = {
        "host": "jokes4us.com",
        path
      };
      const request = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          let line = data.split("<p align=center><font size=5>")[1].split("</font></p>")[0].split("\n").join("");
          line = line.replace(/\(.+?\)/u, "").replace(/You:/u, "").
            replace(/She:/u, "").
            replace(/<br>/u, "");
          line = line.replace(/"/u, "").replace(/'/u, "");
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
    } else {
      this.voiceService.getVoiceConnection(msg).
        then((voiceConnection) => {
          const shame = "I respect you like you read my help-command. Not at all. Don't use parameter for this command.";
          this.ttsService.announceMessage(shame, voiceConnection);
        }).
        catch((err) => console.log(err));
      msg.delete({"timeout": 10000});
    }
  }
}
module.exports = PickupLineCommand;
