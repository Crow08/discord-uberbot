const http = require("http");
const voiceService = require("../VoiceService");
const ttsService = require("../TTSService.js");
const {SlashCommandBuilder} = require("discord.js");

const run = (interaction) => {
  const random = Math.floor(Math.random() * 1192);
  const path = `/yomamajokes/random/yomama${random}.html`;
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
      voiceService.getVoiceConnection(interaction).
        then((voiceConnection) => {
          ttsService.announceMessage(line, voiceConnection);
        }).
        catch((err) => console.log(err));
    });
  });
  request.on("error", (err) => {
    console.log(err.message);
  });
  request.end();
  interaction.reply("Prepare for cringe...");
  setTimeout(() => interaction.deleteReply(), 5000);
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("yomama").
    setDescription("straight facts about your wonderful female parent"),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "A"
};
