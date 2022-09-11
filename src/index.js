const ServiceManager = require("./ServiceManager");
const http = require("http");
const https = require("https");
const fs = require("node:fs");

let debug = false;
let disableWeb = false;
let disableBot = false;
let disableAnnouncer = false;
let settingsPath = "./settings.json";
let settingsUrl = "";

let settings = {};
let loadSettings = null;
// Let musicClient = null;
// Let announcerClient = null;

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
        https.get(settingsUrl, (response) => {
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

// Start bot if enabled.
if (!disableBot || !disableAnnouncer) {
  console.log("\x1b[32m%s\x1b[0m", "--------    UberBot is charging!    --------\n");
  loadSettings.then(async() => {
    // Create base client (discord.js client) and event listeners
    await (ServiceManager.setup(settings));
  }).catch((err) => {
    console.log("\x1b[31m%s\x1b[0m", err);
  });
}

// Start web server if enabled.
if (!disableWeb) {
  console.log("\x1b[34m%s\x1b[0m", "--------    WebServer is starting!    --------\n");
  http.createServer((request, response) => {
    const docPath = request.url === "/" ? "./docs/index.html" : `./docs${request.url}`;
    fs.readFile(docPath, (err, data) => {
      if (err) {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("<link type=\"text/css\" rel=\"stylesheet\" href=\"styles/jsdoc-default.css\">" +
        "<div style=\"text-align: center;height: 100%;width: 100%;display: table;\">" +
        "<div style=\"display: table-cell;vertical-align: middle;\">" +
        `<h1>Error 404 : Not Found</h1>requested path: ${request.url} : [${docPath}]` +
        "</div></div>");
        response.end();
      } else {
        const ext = docPath.substr(docPath.lastIndexOf(".") + 1);
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
