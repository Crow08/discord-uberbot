class VoiceService {
  constructor(bitRate, volume, client, youtubeService, soundCloudService, spotifyService) {
    this.bitRate = bitRate;
    this.volume = volume;

    this.client = client;
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
  }

  playStream(song, msg, seek) {
    return new Promise((resolve, reject) => {
      switch (song.src) {
      case song.srcType.YT:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.playStream(
          this.youtubeService.getStream(song.url),
          {"bitrate": this.bitRate, "volume": this.volume / 100, "passes": 2, "seek": seek ? seek : 0}
        )));
        break;
      case song.srcType.SC:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.playStream(
          this.soundCloudService.getStream(song.url),
          {"bitrate": this.bitRate, "volume": this.volume / 100, "passes": 2, "seek": seek ? seek : 0}
        )));
        break;
      case song.srcType.SP:
        reject(new Error("No implementation to get stream from Spotify!"));
        break;
      default:
        reject(new Error("song src not valid!"));
        break;
      }
    });
  }

  disconnectVoiceConnection(message) {
    const serverId = message.guild.id;
    this.client.voiceConnections.forEach((conn) => {
      if (conn.channel.guild.id === serverId) {
        conn.disconnect();
      }
    });
  }

  getVoiceConnection(message) {
    const serverId = message.guild.id;
    const voiceChannel = message.member.voiceChannel;
    return new Promise((resolve, reject) => {
      // Search for etablished connection with this server.
      const voiceConnection = this.client.voiceConnections.find((val) => val.channel.guild.id === serverId);
      // If not already connected try to join.
      if (voiceConnection === null) {
        if (voiceChannel && voiceChannel.joinable) {
          voiceChannel.join()
            .then((connection) => {
              console.log("use new voice");
              resolve(connection);
            }).catch(() => {
              reject(new Error("Error: Unable to join your voice channel!"));
            });
        } else {
          reject(new Error("Error: Unable to join your voice channel!"));
        }
      } else {
        console.log("reuse voice");
        resolve(voiceConnection);
      }
    });
  }
}

module.exports = VoiceService;
