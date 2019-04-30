/* global require */
const settings = require("./settings.json");
const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");

const baseClient = new Discord.Client();
const musicClient = new MusicClient(baseClient, Discord, {
  "bitRate": settings.bitRate,
  "defVolume": settings.defVolume,
  "scClientId": settings.scClientId,
  "spotifyClientId": settings.spotifyClientId,
  "spotifyClientSecret": settings.spotifyClientSecret
});

baseClient.login(settings.token);

baseClient.on("message", (msg) => {
  if (msg.author.bot && !settings.botTalk) {
    return;
  }
  msg.content.split("\n").forEach((element) => {
    const message = element.trim();
    if (message.startsWith(settings.botPrefix) && msg.channel.type === "text") {
      const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
      const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
      musicClient.execute(cmd, payload, msg);
    }
  });
});

baseClient.on("ready", () => {
  console.log("------- UberBot is fully charged! -------\n>");
});
