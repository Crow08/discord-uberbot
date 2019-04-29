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

/*
Storage.init({
  "dir": "data",
  "stringify": JSON.stringify,
  "parse": JSON.parse,
  "encoding": "utf8",
  "logging": false,
  "ttl": false,
  "expiredInterval": 2 * 60 * 1000, // Every 2 minutes the process will clean-up the expired cache.
  "forgiveParseErrors": false
});

client.on('message', async (message) => {
  if (message.content.substring(0, 1) == '#') {
    var args = message.content.substring(1).split(' ', 2);
    var cmd = args[0];
    var key = args[1];
    var payload = message.content.substring(cmd.length + key.length + 2)
    switch(cmd) {
      case 'add':
        var items = await storage.getItem(args[1]);
        if(!items){
          items = [];
        }
        items.push(payload);
        await storage.setItem(key, items);
        message.channel.send(key + ": " + payload + " Saved!");
        break;
      case 'get':
        var items = await storage.getItem(key);
        items.forEach(function(element) {
          message.channel.send("!play " + element);
        });
        break;
      case 'clear':
        await storage.removeItem(key);
        message.channel.send(key + " Cleared!");
        message.channel.send(item);
        break;
      case 'play':
        getVoiceConnection(message.guild.id, message.member.voiceChannel, message.channel).then(voiceConnection => {
          voiceConnection.playStream (
            //hyperdirect('https://api.soundcloud.com/tracks/' + '175808524' + '/stream?client_id=' + auth.sc_client_id),
            request('https://api.soundcloud.com/tracks/' + '175808524' + '/stream?client_id=' + auth.sc_client_id),
            //ytdl("https://www.youtube.com/watch?v=hsXeFqj5p7Q", { filter: 'audioonly'}),
            {
              bitrate: "128000",
              volume: 1
            });
        }).catch((error) => {
          console.log(error);
        });
    }
  }
});

function getVoiceConnection(serverId, voiceChannel, textChannel){
  return new Promise((resolve, reject) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == serverId);
    if (voiceConnection === null) {
      if (voiceChannel && voiceChannel.joinable) {
        voiceChannel.join()
          .then(connection => {
            resolve(connection);
          }).catch((error) => {
            console.log(error);
          });
      } else {
        textChannel.send("Error: Unable to join your voice channel!")
        reject("Error: Unable to join your voice channel!");
      }
    } else {
      resolve(voiceConnection);
    }
  });
}
*/
