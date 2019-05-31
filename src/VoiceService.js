const Song = require("./Song");

/**
 * Class representing a voice service.
 */
class VoiceService {

  /**
   * Constructor.
   * @param {Object} options - options and user settings for voice connection.
   * @param {Client} client - Discord.js client object.
   * @param {YoutubeService} youtubeService - YoutubeService.
   * @param {SoundCloudService} soundCloudService - SoundCloudService.
   * @param {SpotifyService} spotifyService - SpotifyService.
   */
  constructor(options, client, youtubeService, soundCloudService, spotifyService) {
    this.bitRate = options.bitRate;
    this.volume = options.defVolume;
    this.client = client;
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
  }

  /**
   * Plays stream from the given song and return ste stream dispatcher.
   * @param {Song} song song to be played
   * @param {Message} msg - User message this function is invoked by.
   * @param {number} seek - position in seconds to start the stream from.
   * @returns {Object} - Stream dispatcher.
   */
  playStream(song, msg, seek = 0) {
    return new Promise((resolve, reject) => {
      switch (song.src) {
      case Song.srcType.YT:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.play(
          this.youtubeService.getStream(song.url),
          {"bitrate": this.bitRate, "passes": 3, seek, "volume": (this.volume / 100)}
        ))).
          catch((error) => reject(error));
        break;
      case Song.srcType.SC:
        this.getVoiceConnection(msg).then((conn) => resolve(conn.play(
          this.soundCloudService.getStream(song.url),
          {"bitrate": this.bitRate, "passes": 3, seek, "volume": (this.volume / 100)}
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

  /**
   * Disconnect current voice connection.
   * @param {Message} msg - User message this function is invoked by.
   */
  disconnectVoiceConnection(msg) {
    const serverId = msg.guild.id;
    this.client.voice.connections.forEach((conn) => {
      if (conn.channel.guild.id === serverId) {
        conn.disconnect();
      }
    });
  }

  /**
   * Establish new voice connection.
   * If a connection is already established disconnect first.
   * @param {Message} msg - User message this function is invoked by.
   */
  getVoiceConnection(msg) {
    if (typeof msg.guild === "undefined") {
      return new Promise((resolve, reject) => reject(new Error("Unable to find discord server!")));
    }
    const serverId = msg.guild.id;
    const voiceChannel = msg.member.voice.channel;
    return new Promise((resolve, reject) => {
      // Search for established connection with this server.
      const voiceConnection = this.client.voice.connections.find((val) => val.channel.guild.id === serverId);
      // If not already connected try to join.
      if (typeof voiceConnection === "undefined") {
        if (voiceChannel && voiceChannel.joinable) {
          voiceChannel.join().
            then((connection) => {
              resolve(connection);
            }).
            catch(() => {
              reject(new Error("Unable to join your voice channel!"));
            });
        } else {
          reject(new Error("Unable to join your voice channel!"));
        }
      } else {
        resolve(voiceConnection);
      }
    });
  }
}

module.exports = VoiceService;
