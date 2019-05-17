const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");
const readline = require("readline");
const settings = require("../settings.json");

// Script starts here:

console.log("\x1b[32m%s\x1b[0m", "--------    UberBot is charging!    --------\n");

// Check if all necessary settings are set.
if (typeof settings === "undefined" ||
  (typeof settings.scClientId === "undefined" || settings.scClientId === "SOUNDCLOUD_CLIENT_ID") ||
  (typeof settings.spotifyClientId === "undefined" || settings.spotifyClientId === "SPOTIFY_CLIENT_ID") ||
  (typeof settings.spotifyClientSecret === "undefined" || settings.spotifyClientSecret === "SPOTIFY_CLIENT_SECRET") ||
  (typeof settings.youtubeApiKey === "undefined" || settings.youtubeApiKey === "YOUTUBE_API_KEY")) {
  throw new Error("Necessary settings are not set! (please check your settings.json for missing API credentials.)");
}

// Create base client (discord.js client) and music client (uberbot client) providing the main functionality of the bot.
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

// Login to Discord.
baseClient.login(settings.token).
  catch((err) => console.log(err));

// Message processing for receiving bot commands.
const processMsg = function processMsg(msg) {
  // Don't execute commands from bots if not set otherwise.
  if (msg.author.bot && !JSON.parse(settings.botTalk)) {
    return;
  }
  // Split multiline messages to allow multiple commands in one message.
  msg.content.split("\n").forEach((element) => {
    const message = element.trim();
    // If message is a command for this bot.
    if (message.startsWith(settings.botPrefix) && (msg.channel.type === "text" || msg.channel.type === "dm")) {
      const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
      const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
      // Process command here.
      musicClient.execute(cmd, payload, msg);
    }
  });
};

// Catch new message event.
baseClient.on("message", (msg) => processMsg(msg));

// Catch edited message event.
baseClient.on("messageUpdate", (oldMsg, newMsg) => {
  if (oldMsg.content !== newMsg.content) {
    processMsg(newMsg);
  }
});

// Catch ready event, which will be called after login to Discord was successful.
baseClient.on("ready", () => {
  // Disconnect from any voice channels currently connected to.
  baseClient.guilds.forEach((guild) => {
    guild.channels.forEach((channel) => {
      if (channel.type === "voice") {
        channel.members.forEach((member) => {
          if (member.id === guild.me.id) {
            channel.join().then(() => channel.leave());
          }
        });
      }
    });
  });
  // Poll for DB connection.
  const timeout = new Date().getTime + 2000;
  const checkDBConnection = () => {
    if (musicClient.dbService.isConnected()) {
      console.log("\x1b[32m%s\x1b[0m", "-------- UberBot is fully charged!  --------\n");
    } else if (new Date().getTime < timeout) {
      setTimeout(checkDBConnection, 100);
    } else {
      throw new Error("DB connection timed out!");
    }
  };
  checkDBConnection();
});

// DEBUG STUFF:

// Create console interface to execute command from there.
const rl = readline.createInterface({
  "input": process.stdin,
  "output": process.stdout
});

// Catch console input.
rl.on("line", (input) => {
  const message = input.trim();
  if (message.startsWith(settings.botPrefix)) {
    const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
    const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
    musicClient.execute(cmd, payload, {"author": {"username": "debug_console"}});
  }
});

// Print debug info from base client.
baseClient.on("debug", (info) => {
  if (process.argv.includes("debug")) {
    console.log(info);
  }
});
