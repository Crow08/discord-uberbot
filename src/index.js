const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");
const AnnouncerClient = require("./AnnouncerClient.js");
const readline = require("readline");
const http = require("http");
const fs = require("fs");

let debug = false;
let disableWeb = false;
let disableBot = false;
let disableAnnouncer = false;
let settingsPath = "./settings.json";
let settingsUrl = "";

let settings = {};
let loadSettings = null;
let baseClient = null;
let musicClient = null;
let announcerClient = null;

// Parsing command line arguments.
process.argv.forEach((arg) => {
  if (arg === "debug") {
    debug = true;
  } else if (arg === "disable_web") {
    disableWeb = true;
  } else if (arg === "disable_bot") {
    disableBot = true;
  } else if (arg === "disable_announcer") {
    disableAnnouncer = true;
  } else if (arg.match(/^settings_url=.+/u)) {
    settingsUrl = arg.split("=")[1];
  } else if (arg.match(/^settings_path=.+/u)) {
    settingsPath = arg.split("=")[1];
  }
});

// Parsing environment variables.
if (debug === false && typeof process.env.debug !== "undefined") {
  debug = typeof process.env.debug;
}
if (disableWeb === false && typeof process.env.disable_web !== "undefined") {
  disableWeb = typeof process.env.disable_web;
}
if (disableBot === false && typeof process.env.disable_bot !== "undefined") {
  disableBot = typeof process.env.disable_bot;
}
if (disableAnnouncer === false && typeof process.env.disable_announcer !== "undefined") {
  disableAnnouncer = typeof process.env.disable_announcer;
}
if (settingsUrl === "" && typeof process.env.settings_url !== "undefined") {
  settingsUrl = process.env.settings_url;
}
if (settingsPath === "" && typeof process.env.settings_path !== "undefined") {
  settingsPath = process.env.settings_url;
}

// Message processing for receiving bot commands.
const processMsg = (msg) => {
  // Don't execute commands from bots if not set otherwise.
  if (msg.author.bot && !JSON.parse(settings.botTalk)) {
    return;
  }
  // Split multiline messages to allow multiple commands in one message.
  msg.content.split("\n").forEach((element) => {
    const message = element.trim();
    // If message is a command for this bot.
    if (message.startsWith(settings.botPrefix) && (msg.channel.type === "text" || msg.channel.type === "dm")) {
      const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0].toLowerCase();
      const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
      // Process command here.
      if ((musicClient && musicClient.execute(cmd, payload, msg)) ||
          (announcerClient && announcerClient.execute(cmd, payload, msg))) {
        msg.react("✅");
        console.log("\x1b[37m%s\x1b[0m", `> CMD: ${cmd}\n`);
      } else {
        msg.react("❎");
        console.log("\x1b[37m%s\x1b[0m", `> unrecognized command name: ${cmd}\n`);
      }
    }
  });
};

// Setup Listeners for Discord.js events on base client.
const setDiscordEventListeners = () => {
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
            if (member.id === guild.me.id && channel.id !== settings.defaultVoiceChannel) {
              channel.join().finally(() => channel.leave());
            }
          });
          // (Re-) Join default channel.
          if (settings.defaultVoiceChannel && channel.id === settings.defaultVoiceChannel) {
            channel.join();
            if (settings.defaultTextChannel) {
              guild.channels.get(settings.defaultTextChannel).send("UberBot is fully charged!");
            }
          }
        }
      });
    });
  });

  // Print debug info from base client.
  baseClient.on("debug", (info) => {
    if (debug) {
      console.log(info);
    }
  });
};

// Setup Listeners for shell events.
const setConsoleEventListeners = () => {
  // Create console interface to execute commands directly form the shell.
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
      if ((musicClient && musicClient.execute(cmd, payload, {"author": {"username": "debug_console"}})) ||
          (announcerClient && announcerClient.execute(cmd, payload, {"author": {"username": "debug_console"}}))) {
        console.log("\x1b[37m%s\x1b[0m", `> CMD: ${cmd}\n`);
      } else {
        console.log("\x1b[37m%s\x1b[0m", `> unrecognized command name: ${cmd}\n`);
      }
    }
  });
};

// Fill in missing settings with default values and validate settings.
const validateSettings = (() => new Promise((resolve, reject) => {
  // Set default values if necessary.
  settings.bitRat = typeof settings.bitRate === "undefined" ? 96000 : parseInt(settings.bitRate, 10);
  settings.botPrefix = typeof settings.botPrefix === "undefined" ? "!" : settings.botPrefix;
  settings.defVolume = typeof settings.defVolume === "undefined" ? 50 : parseInt(settings.defVolume, 10);
  settings.ratingCooldown = typeof settings.ratingCooldown === "undefined" ? 86400
    : parseInt(settings.ratingCooldown, 10);
  // Check for missing credentials.
  const missingInfoError = new Error("Your setting file is missing some necessary information!\n" +
  "Please check your settings file for missing API credentials.\n" +
  "Take a look at settings.example.json for reference.");
  if (!disableBot && (typeof settings.youtubeApiKey === "undefined" || settings.youtubeApiKey === "YOUTUBE_API_KEY")) {
    reject(missingInfoError);
  } else if (!disableAnnouncer && (typeof settings.ttsApiKey === "undefined" || settings.ttsApiKey === "TTS_API_KEY")) {
    reject(missingInfoError);
  }
  resolve();
}));

// Initialize and set up discord.js client to receive discord events.
const initBaseClient = (() => {
  if (!baseClient) {
    baseClient = new Discord.Client();
    // Set up event listeners for Discord events like incoming messages.
    setDiscordEventListeners();
    // Setup console listeners for debugging purposes.
    setConsoleEventListeners();
    // Login to Discord.
    return baseClient.login(settings.token);
  }
  return new Promise((resolve) => resolve());

});

// Settings are needed for announcer or music bot functionality.
if (!disableBot || !disableAnnouncer) {
  // Load settings.
  loadSettings = new Promise((resolve, reject) => {
    fs.access(settingsPath, fs.constants.F_OK, (existsErr) => {
      // If settings file exists:
      if (!existsErr) {
        // Read settings file.
        fs.readFile(settingsPath, (readErr, rawData) => {
          if (readErr) {
            reject(readErr);
            return;
          }
          settings = JSON.parse(rawData);
          // Check if all necessary settings are set.
          validateSettings().
            then(resolve).
            catch(reject);
        });
      // If settingsUrl is set:
      } else if (settingsUrl.length > 0) {
        // Download settings file.
        http.get(settingsUrl, (response) => {
          response.setEncoding("utf8");
          let rawData = "";
          response.on("data", (chunk) => {
            rawData += chunk;
          });
          response.on("end", () => {
            settings = JSON.parse(rawData);
            // Check if all necessary settings are set.
            validateSettings().
              then(resolve).
              catch(reject);
          });
        }).on("error", (httpErr) => {
          reject(httpErr);
        });
      } else {
        reject(new Error("Failed to load settings file!\n" +
          "Please provide a settings file at the default location (\"./settings.json\") " +
          "or set a path through the \"settings_path\" argument.\n" +
          "Alternatively you can provide \"settings_url\" as argument to refer a remote settings file."));
      }
    });
  });
}

// Start music bot if enabled.
if (!disableBot) {
  console.log("\x1b[32m%s\x1b[0m", "--------    UberBot is charging!    --------\n");
  loadSettings.then(() => {
    // Create base client (discord.js client) and event listeners
    initBaseClient().
      catch((err) => {
        throw new Error(err);
      });
    // Create music client for all music functions.
    musicClient = new MusicClient(baseClient, Discord.MessageEmbed, settings);

    // Poll for DB connection.
    const timeout = new Date().getTime() + 30000;
    const checkDBConnection = () => {
      if (musicClient.dbService.isConnected()) {
        console.log("\x1b[32m%s\x1b[0m", "-------- UberBot is fully charged!  --------\n");
      } else if (new Date().getTime() < timeout) {
        setTimeout(checkDBConnection, 100);
      } else {
        throw new Error("DB connection timeout!");
      }
    };
    checkDBConnection();
  }).
    catch((err) => {
      console.log("\x1b[31m%s\x1b[0m", err);
    });
}

// Start announcer bot if enabled.
if (!disableAnnouncer) {
  console.log("\x1b[33m%s\x1b[0m", "--------    Announcer is starting!    --------\n");
  loadSettings.then(() => {
    // Create base client (discord.js client) and event listeners
    initBaseClient().
      then(() => console.log("\x1b[33m%s\x1b[0m", "--------    Announcer successfully started!     --------\n")).
      catch((err) => {
        throw new Error(err);
      });
    // Create announcer client for tts announcements.
    announcerClient = new AnnouncerClient(baseClient, Discord.MessageEmbed, settings);
  }).
    catch((err) => {
      console.log("\x1b[31m%s\x1b[0m", err);
    });
}

// Start web server if enabled.
if (!disableWeb) {
  console.log("\x1b[34m%s\x1b[0m", "--------    WebServer is starting!    --------\n");
  http.createServer((request, response) => {
    const path = request.url === "/" ? "./docs/index.html" : `./docs${request.url}`;
    fs.readFile(path, (err, data) => {
      if (err) {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("<link type=\"text/css\" rel=\"stylesheet\" href=\"styles/jsdoc-default.css\">" +
        "<div style=\"text-align: center;height: 100%;width: 100%;display: table;\">" +
        "<div style=\"display: table-cell;vertical-align: middle;\">" +
        `<h1>Error 404 : Not Found</h1>requested path: ${request.url} : [${path}]` +
        "</div></div>");
        response.end();
      } else {
        const ext = path.substr(path.lastIndexOf(".") + 1);
        response.writeHead(200, {"Content-Type": `text/${ext}`});
        response.write(data);
        response.end();
      }
    });
  }).listen(
    process.env.PORT || 8080,
    () => console.log("\x1b[34m%s\x1b[0m", "--------    WebServer successfully started!    --------\n")
  );
}
