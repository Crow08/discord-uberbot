const Discord = require("discord.js");
const MusicClient = require("./MusicClient.js");
const readline = require("readline");
const http = require("http");
const fs = require("fs");

let debug = false;
let webOnly = false;
let botOnly = false;
let settingsPath = "./settings.json";
let settingsUrl = "";

let settings = {};
let baseClient = null;
let musicClient = null;

// Parsing command line arguments.
process.argv.forEach((arg) => {
  if (arg === "debug") {
    debug = true;
  } else if (arg === "web_only") {
    webOnly = true;
  } else if (arg === "bot_only") {
    botOnly = true;
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
if (webOnly === false && typeof process.env.web_only !== "undefined") {
  webOnly = typeof process.env.web_only;
}
if (botOnly === false && typeof process.env.bot_only !== "undefined") {
  botOnly = typeof process.env.bot_only;
}
if (settingsUrl === "" && typeof process.env.settings_url !== "undefined") {
  settingsUrl = process.env.settings_url;
}
if (settingsPath === "" && typeof process.env.settings_path !== "undefined") {
  settingsPath = process.env.settings_url;
}

// Load settings.
const loadSettings = () => new Promise((resolve, reject) => {
  fs.access(settingsPath, fs.constants.F_OK, (existsErr) => {
    // If settings file exists:
    if (!existsErr) {
      // Read settings file.
      fs.readFile(settingsPath, (readErr, rawData) => {
        if (readErr) {
          reject(readErr);
          return;
        }
        resolve(JSON.parse(rawData));
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
          resolve(JSON.parse(rawData));
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

// Message processing for receiving bot commands.
const processMsg = (msg) => {
  // Don't execute commands from bots if not set otherwise.
  if (msg.author.bot && !JSON.parse(settings.botTalk)) {
    return;
  }
  // Split multiline messages to allow multiple commands in one message.
  msg.content.split("\n").forEach((element) => {
    const message = element.trim().toLowerCase();
    // If message is a command for this bot.
    if (message.startsWith(settings.botPrefix) && (msg.channel.type === "text" || msg.channel.type === "dm")) {
      const cmd = message.substr(settings.botPrefix.length).split(" ", 1)[0];
      const payload = message.substr(cmd.length + settings.botPrefix.length + 1);
      // Process command here.
      musicClient.execute(cmd, payload, msg);
    }
  });
};

// Setup Listeners for Discord.js events on base client.
const setBotEventListeners = () => {
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
    const timeout = new Date().getTime() + 30000;
    const checkDBConnection = () => {
      if (musicClient.dbService.isConnected()) {
        console.log("\x1b[32m%s\x1b[0m", "-------- UberBot is fully charged!  --------\n");
      } else if (new Date().getTime() < timeout) {
        setTimeout(checkDBConnection, 100);
      } else {
        throw new Error("DB connection timed out!");
      }
    };
    checkDBConnection();
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
      musicClient.execute(cmd, payload, {"author": {"username": "debug_console"}});
    }
  });
};

// Fill in missing settings with default values and validate settings.
const validateSettings = (() => {
  // Set default values if necessary.
  settings.bitRat = typeof settings.bitRate === "undefined" ? 96000 : parseInt(settings.bitRate, 10);
  settings.botPrefix = typeof settings.botPrefix === "undefined" ? "!" : settings.botPrefix;
  settings.defVolume = typeof settings.defVolume === "undefined" ? 50 : parseInt(settings.defVolume, 10);
  settings.ratingCooldown = typeof settings.ratingCooldown === "undefined" ? 86400
    : parseInt(settings.ratingCooldown, 10);
  // Check for missing credentials.
  return ((typeof settings.scClientId !== "undefined" && settings.scClientId !== "SOUNDCLOUD_CLIENT_ID") ||
    (typeof settings.spotifyClientId !== "undefined" && settings.spotifyClientId !== "SPOTIFY_CLIENT_ID") ||
    (typeof settings.spotifyClientSecret !== "undefined" && settings.spotifyClientSecret !== "SPOTIFY_CLIENT_SECRET") ||
    (typeof settings.youtubeApiKey !== "undefined" && settings.youtubeApiKey !== "YOUTUBE_API_KEY"));
});

// Script starts here:
if (!webOnly) {
  console.log("\x1b[32m%s\x1b[0m", "--------    UberBot is charging!    --------\n");
  loadSettings().then((json) => {
    settings = json;
    // Check if all necessary settings are set.
    if (!validateSettings()) {
      console.log("\x1b[31m%s\x1b[0m", new Error("Your setting file is missing some necessary information!\n" +
        "Please check your settings file for missing API credentials.\n" +
        "Take a look at settings.example.json for reference."));
      return;
    }

    // Create base client (discord.js client) and music client (uberbot client).
    // These provide the main functionality of the bot.
    baseClient = new Discord.Client();
    musicClient = new MusicClient(baseClient, Discord.MessageEmbed, settings);

    // Set up event listeners for Discord events like incoming messages.
    setBotEventListeners();

    // Setup console listeners for debugging purposes.
    setConsoleEventListeners();

    // Login to Discord.
    baseClient.login(settings.token).
      catch((err) => console.log(err));
  }).
    catch((err) => {
      console.log("\x1b[31m%s\x1b[0m", err);
    });
}

if (!botOnly) {
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
