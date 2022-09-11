const voiceService = require("../VoiceService");
const chatService = require("../ChatService");
const streamSourceService = require("../StreamSourceService");
const ttsService = require("../TTSService");
const voiceLines = require("../../voiceLines.json");
const {SlashCommandBuilder} = require("discord.js");

const getSfxUrl = (json, payload) => {
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
};

const say = (text, interaction) => {
  voiceService.getVoiceConnection(interaction).
    then((voiceConnection) => {
      ttsService.announceMessage(text, voiceConnection);
    }).
    catch((err) => console.log(err));
};

const makeTable = (json) => {
  const table = [];
  const maxColumLength = [];
  let maxLines = 0;
  let count = 0;
  Object.keys(json.sfx).
    forEach((header) => {
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
  tableString = tableString.replace(/\n/u, `\n${splitter}\n`);
  return (`${splitter}\n${tableString}${splitter}`);
};

const run = (interaction) => {
  const index = interaction.options.getString("index");
  if (index === null) {
    chatService.simpleNote(interaction, "List sfx:", chatService.msgType.MUSIC, true);
    chatService.send(interaction, `\`\`\`cs\n${makeTable(voiceLines)}\n\`\`\``);
  }
  if (index > voiceLines.sfx.length - 1) {
    chatService.simpleNote(interaction, "Index out of bounds.", chatService.msgType.Error, true);
    say("This is a voice line from the future. You have to add it first!", interaction);
    return;
  }
  if (index < 0) {
    chatService.simpleNote(interaction, "Index out of bounds.", chatService.msgType.Error, true);
    say("Oh I know, let's enter a negative number, that will show her.", interaction);
    return;
  }
  chatService.simpleNote(interaction, "Playing sfx.", chatService.msgType.Error, true);
  streamSourceService.rawFileService.getStream(getSfxUrl(voiceLines.sfx, index)).
    then((sfx) => {
      voiceService.getVoiceConnection(interaction).
        then((voiceConnection) => {
          voiceConnection.play(sfx);
        });
    }).
    catch(((err) => console.log(err)));
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("sfx").
    setDescription("make the bot play dumb stuff").
    addIntegerOption((option) => option.
      setName("index").
      setDescription("index of the sfx to play").
      setRequired(false)),
  async execute(interaction) {
    await run(interaction);
  }
};
