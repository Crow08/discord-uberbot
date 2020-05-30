const Song = require("./Song");

/**
 * Class representing a voice service.
 */
class VoiceService {

  /**
   * Constructor.
   * @param {Object} options - options and user settings for voice connection.
   * @param {Client} client - Discord.js client object.
   * @param {StreamSourceService} streamSourceService - StreamSourceService.
   */
  constructor(options, client, streamSourceService) {
    this.bitRate = options.bitRate;
    this.volume = options.defVolume;
    this.client = client;
    this.youtubeService = streamSourceService.youtubeService;
    this.soundCloudService = streamSourceService.soundCloudService;
    this.spotifyService = streamSourceService.spotifyService;
    this.rawFileService = streamSourceService.rawFileService;
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
      const opt = {"bitrate": this.bitRate, "fec": false, "highWaterMark": 64, seek, "volume": (this.volume / 100)};
      if (song.src === Song.srcType.YT) {
        opt.type = "opus";
      }
      this.getVoiceConnection(msg).
        then((conn) => this.getStream(song).
          then((stream) => resolve(conn.play(stream, opt))).
          catch((err) => reject(err))).
        catch((err) => reject(err));
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

  /**
   * Check if a voice connection to the server of the message is established.
   * @param {Message} msg - User message this function is invoked by.
   */
  isVoiceConnected(msg) {
    if (typeof msg.guild === "undefined") {
      return false;
    }
    const serverId = msg.guild.id;
    // Search for established connection with this server.
    const voiceConnection = this.client.voice.connections.find((val) => val.channel.guild.id === serverId);

    return typeof voiceConnection !== "undefined";
  }

  /**
   * Resolve the streaming source of a Song and get the stream accordingly as a promise.
   * @private
   * @param {Song} song song to get the Stream from
   */
  getStream(song) {
    return new Promise((resolve, reject) => {
      switch (song.src) {
      case Song.srcType.YT:
        resolve(this.youtubeService.getStream(song.url));
        break;
      case Song.srcType.SC:
        resolve(this.soundCloudService.getStream(song.url));
        break;
      case Song.srcType.SP:
        reject(new Error("No implementation to get stream from Spotify!"));
        break;
      case Song.srcType.RAW:
        resolve(this.rawFileService.getStream(song.url));
        break;
      default:
        reject(new Error("song src not valid!"));
      }
    });
  }
}

module.exports = VoiceService;
