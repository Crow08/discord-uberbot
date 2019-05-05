/* global require */
const settings = require("../settings.json");
const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");
const readline = require("readline");

const baseClient = new Discord.Client();
const musicClient = new MusicClient(baseClient, Discord, {
  "bitRate": settings.bitRate,
  "defVolume": settings.defVolume,
  "scClientId": settings.scClientId,
  "spotifyClientId": settings.spotifyClientId,
  "spotifyClientSecret": settings.spotifyClientSecret,
  "youtubeApiKey": settings.youtubeApiKey
});

if (!process.argv.includes("no_dc")) {
  baseClient.login(settings.token);
}

const processMsg = function processMsg(msg) {
  if (msg.author.bot && !settings.botTalk) {
    return;
  }
  msg.content.split("\n").forEach((element) => {
    const message = element.trim();
    if (message.startsWith(settings.botPrefix) && (msg.channel.type === "text" || msg.channel.type === "dm")) {
      const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
      const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
      musicClient.execute(cmd, payload, msg);
    }
  });
};

baseClient.on("message", (msg) => processMsg(msg));

baseClient.on("messageUpdate", (oldMsg, newMsg) => {
  if (oldMsg.content !== newMsg.content) {
    processMsg(newMsg);
  }
});

baseClient.on("ready", () => {
  console.log("------- UberBot is fully charged! -------\n>");
});

// DEBUG STUFF:

const rl = readline.createInterface({
  "input": process.stdin,
  "output": process.stdout
});

rl.on("line", (input) => {
  const message = input.trim();
  if (message.startsWith(settings.botPrefix)) {
    const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
    const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
    musicClient.execute(cmd, payload);
  }
});
