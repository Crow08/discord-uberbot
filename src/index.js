const settings = require("../settings.json");
const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");
const readline = require("readline");

console.log("\x1b[32m%s\x1b[0m", "--------    UberBot is charging!    --------\n");

if (typeof settings === "undefined" ||
  (typeof settings.scClientId === "undefined" || settings.scClientId === "SOUNDCLOUD_CLIENT_ID") ||
  (typeof settings.spotifyClientId === "undefined" || settings.spotifyClientId === "SPOTIFY_CLIENT_ID") ||
  (typeof settings.spotifyClientSecret === "undefined" || settings.spotifyClientSecret === "SPOTIFY_CLIENT_SECRET") ||
  (typeof settings.youtubeApiKey === "undefined" || settings.youtubeApiKey === "YOUTUBE_API_KEY")) {
  throw new Error("Necessary settings are not set! (please check your settings.json for missing API credentials.)");
}

const baseClient = new Discord.Client();
const musicClient = new MusicClient(baseClient, Discord.MessageEmbed, {
  "bitRate": typeof settings.bitRate === "undefined" ? 96000 : parseInt(settings.bitRate, 10),
  "botPrefix": typeof settings.botPrefix === "undefined" ? "!" : settings.botPrefix,
  "defVolume": typeof settings.defVolume === "undefined" ? 50 : parseInt(settings.defVolume, 10),
  "ratingCooldown": typeof settings.ratingCooldown === "undefined" ? 86400 : parseInt(settings.ratingCooldown, 10),
  "scClientId": settings.scClientId,
  "spotifyClientId": settings.spotifyClientId,
  "spotifyClientSecret": settings.spotifyClientSecret,
  "youtubeApiKey": settings.youtubeApiKey
});

baseClient.login(settings.token).
  catch((err) => console.log(err));

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
  const endTime = new Date().getTime + 2000;
  const interval = 100;
  const checkCondition = function checkCondition() {
    if (musicClient.dbService.isConnected()) {
      console.log("\x1b[32m%s\x1b[0m", "-------- UberBot is fully charged!  --------\n");
    } else if (new Date().getTime < endTime) {
      setTimeout(checkCondition, interval);
    } else {
      throw new Error("DB connection timed out!");
    }
  };
  checkCondition();
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
    musicClient.execute(cmd, payload, {"author": {"username": "debug_console"}});
  }
});

baseClient.on("debug", (info) => {
  if (process.argv.includes("debug")) {
    console.log(info);
  }
});
