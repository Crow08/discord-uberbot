/* global require */
const auth = require("./auth.json");
const storage = require("node-persist");
const request = require("request");
const Discord = require("discord.js");
const client = new Discord.Client();
client.music = require("./music.js");

client.music.start(client, {
  "youtubeKey": auth.youtube_key,
  "anyoneCanSkip": true,
  "ownerOverMember": true,
  "ownerID": "Crow08#0285",
  "cooldown": {
    "enabled": false
  },
  "botPrefix": "#",
  "defaultPrefix": "#",
  "bitRate": "128000",
  "defVolume": 50,
  "maxQueueSize": 0
});

storage.init({
  "dir": "data",
  "stringify": JSON.stringify,
  "parse": JSON.parse,
  "encoding": "utf8",
  "logging": false,
  "ttl": false,
  "expiredInterval": 2 * 60 * 1000, // Every 2 minutes the process will clean-up the expired cache.
  "forgiveParseErrors": false
});

client.login(auth.token);

/*
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
