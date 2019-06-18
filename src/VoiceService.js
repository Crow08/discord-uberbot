const Song = require("./Song");
const googleTTS = require("google-tts-api");
const voiceLines = require("../voiceLines.json");

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
  constructor(options, client, youtubeService, soundCloudService, spotifyService, rawFileService) {
    this.bitRate = options.bitRate;
    this.volume = options.defVolume;
    this.phoneticNicknames = options.phoneticNicknames;
    this.client = client;
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
    this.rawFileService = rawFileService;
    this.setupVoiceStateListener();
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
      const opt = {"bitrate": this.bitRate, "passes": 3, seek, "volume": (this.volume / 100)};
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

  /**
   * Setup user join or leave events with announcer tts voice.
   * @private
   */
  setupVoiceStateListener() {
    this.client.on("voiceStateUpdate", (oldState, newState) => {
      const newUserChannel = newState.channel;
      const oldUserChannel = oldState.channel;
      const voiceConnection = this.client.voice.connections.find((val) => val.channel.guild.id === newState.guild.id);
      if (typeof voiceConnection !== "undefined") {
        const newUser = newState.member.displayName;
        if (voiceConnection.channel && oldUserChannel && newUserChannel &&
          newUserChannel.id === voiceConnection.channel.id && oldUserChannel.id !== voiceConnection.channel.id) {
          // User joins voice channel of bot
          const messageJoin = voiceLines.join[Math.floor(Math.random() * voiceLines.join.length)].
            replace("#User", this.phoneticNicknameFor(newUser));
          this.announceMessage(messageJoin, voiceConnection);
        } else if (voiceConnection.channel && oldUserChannel && newUserChannel &&
          oldUserChannel.id === voiceConnection.channel.id && newUserChannel.id !== voiceConnection.channel.id) {
          // User leaves voice channel of bot
          const messageLeave = voiceLines.leave[Math.floor(Math.random() * voiceLines.leave.length)].
            replace("#User", this.phoneticNicknameFor(newUser));
          this.announceMessage(messageLeave, voiceConnection);
        }
      }
    });
  }

  /**
   * Lookup phonetic nickname.
   * @private
   * @param {string} userName Username to process.
   */
  phoneticNicknameFor(userName) {
    if (this.phoneticNicknames && userName in this.phoneticNicknames) {
      return this.phoneticNicknames[userName];
    }
    return userName;
  }

  /**
   * Announce the given message via tts to the given connection.
   * @private
   * @param {string} message Message to announce.
   * @param {VoiceConnection} voiceConnection Discord.js Voice connection to announce to.
   */
  announceMessage(message, voiceConnection) {
    googleTTS(message, "en-US", 1). // Speed normal = 1 (default), slow = 0.24
      then((url) => {
        this.rawFileService.getStream(url).then((stream) => {
          const oldDispatcher = voiceConnection.dispatcher;
          const dispatcher = voiceConnection.play(stream);
          dispatcher.on("end", () => {
            if (oldDispatcher && !oldDispatcher.paused) {
              oldDispatcher.end();
            }
          });
        });
      }).
      catch((err) => {
        if (voiceConnection.dispatcher && !voiceConnection.dispatcher.paused) {
          voiceConnection.dispatcher.end();
        }
        console.log(err);
      });
  }
}

module.exports = VoiceService;
