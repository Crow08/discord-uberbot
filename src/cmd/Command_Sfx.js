const Command = require("./Command.js");
const voiceLines = require("../../voiceLines.json");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class SfxCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {RawFileService} rawFileService - RawFileService.
   */
  constructor(voiceService, rawFileService, chatService, ttsService) {
    super(
      ["sfx"],
      "make the bot play dumb stuff",
      "<prefix>sfx [index of sfx / empty for whole list]"
    );
    this.voiceService = voiceService;
    this.rawFileService = rawFileService;
    this.chatService = chatService;
    this.ttsService = ttsService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    if (payload > voiceLines.sfx.length - 1) {
      this.say("This is a voice line from the future. You have to add it first!", msg);
      return;
    }
    if (payload < 0) {
      this.say("Oh I know, let's enter a negative number, that will show her. Pathetic!", msg);
      return;
    }
    if (isNaN(payload)) {
      this.say("Oh my goodness, what are you doing? Please enter a number. You know? Like 1 or 2?", msg);
      return;
    }
    if (payload === "undefined" || payload === "" || payload.length === 0) {
      this.chatService.send(msg, `\`\`\`cs\n${this.makeTable(voiceLines)}\n\`\`\``);
    } else {

      this.rawFileService.getStream(this.getSfxUrl(voiceLines.sfx, payload)).
        then((sfx) => {
          this.voiceService.getVoiceConnection(msg).
            then((voiceConnection) => {
              voiceConnection.play(sfx);
            });
        }).
        catch(((err) => console.log(err)));
      msg.delete({"timeout": 10000});
    }

  }

  getSfxUrl(json, payload) {
    const sfxUrls = [];
    for (const topic in json) {
      if (topic) {
        for (const element in json[topic]) {
          if (element) {
            sfxUrls.push(json[topic][element].url);
          }
        }
      }
    }
    const sfxUrl = sfxUrls[payload];
    return (sfxUrl);
  }

  say(text, msg) {
    this.voiceService.getVoiceConnection(msg).
      then((voiceConnection) => {
        this.ttsService.announceMessage(text, voiceConnection);
      }).
      catch((err) => console.log(err));
    msg.delete({"timeout": 10000});
  }

  makeTable(json) {
    const table = [];
    const maxColumLength = [];
    let maxLines = 0;
    let count = 0;
    Object.keys(json.sfx).forEach((header) => {
      table.push([header]);
      maxColumLength.push(header.length);
      json.sfx[header].forEach((element) => {
        table[table.length - 1].push(`${count}: ${element.title}`);
        count++;
        // eslint-disable-next-line max-len
        maxColumLength[table.length - 1] = maxColumLength[table.length - 1] < element.title.length ? element.title.length : maxColumLength[table.length - 1];
      });
      maxLines = maxLines < table[table.length - 1].length ? table[table.length - 1].length : maxLines;
    });
    let tableString = "";
    for (let row = 0; row < maxLines; row++) {
      for (let column = 0; column < Object.keys(json.sfx).length; column++) {
        if (tableString[tableString.length - 1] === "|") {
          tableString = tableString.substr(0, tableString.length - 1);
        }
        if (table[column].length > row) {
          tableString += `| ${table[column][row].padEnd(maxColumLength[column] + 4, " ")}|`;
        } else {
          tableString += `| ${"".padEnd(maxColumLength[column] + 4, " ")}|`;
        }
      }
      tableString += "\n";
    }

    let splitter = "|";
    maxColumLength.forEach((length) => {
      splitter += `${"".padEnd(length + 5, "-")}|`;
    });
    tableString = tableString.replace(/\n/, `\n${splitter}\n`);
    return (`${splitter}\n${tableString}${splitter}`);
  }
}
module.exports = SfxCommand;
