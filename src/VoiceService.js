const Song = require("./Song");

class VoiceService {
  constructor(options, client, youtubeService, soundCloudService, spotifyService) {
    this.bitRate = options.bitRate;
    this.volume = options.defVolume;
    this.client = client;
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
  }

  playStream(song, msg, seek) {
    return new Promise((resolve, reject) => {
      switch (song.src) {
      case Song.srcType.YT:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.play(
          this.youtubeService.getStream(song.url),
          {"bitrate": this.bitRate, "passes": 5, "seek": seek ? seek : 0, "volume": (this.volume / 100)}
        ))).
          catch((error) => reject(error));
        break;
      case Song.srcType.SC:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.play(
          this.soundCloudService.getStream(song.url),
          {"bitrate": this.bitRate, "passes": 5, "seek": seek ? seek : 0, "volume": (this.volume / 100)}
        ))).
          catch((error) => reject(error));
        break;
      case Song.srcType.SP:
        reject(new Error("No implementation to get stream from Spotify!"));
        break;
      default:
        reject(new Error("song src not valid!"));
        break;
      }
    });
  }

  disconnectVoiceConnection(msg) {
    const serverId = msg.guild.id;
    this.client.voice.connections.forEach((conn) => {
      if (conn.channel.guild.id === serverId) {
        conn.disconnect();
      }
    });
  }

  getVoiceConnection(msg) {
    if (typeof msg.guild === "undefined") {
      return new Promise((resolve, reject) => reject(new Error("Unable to find discord server!")));
    }
    const serverId = msg.guild.id;
    const voiceChannel = msg.member.voice.channel;
    return new Promise((resolve, reject) => {
      // Search for etablished connection with this server.
      const voiceConnection = this.client.voice.connections.find((val) => val.channel.guild.id === serverId);
      // If not already connected try to join.
      if (typeof voiceConnection === "undefined") {
        if (voiceChannel && voiceChannel.joinable) {
          voiceChannel.join().
            then((connection) => {
              console.log("use new voice");
              resolve(connection);
            }).
            catch(() => {
              reject(new Error("Unable to join your voice channel!"));
            });
        } else {
          reject(new Error("Unable to join your voice channel!"));
        }
      } else {
        console.log("reuse voice");
        resolve(voiceConnection);
      }
    });
  }
}

module.exports = VoiceService;
