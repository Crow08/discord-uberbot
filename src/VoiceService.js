const Song = require("./Song");
const {spawn} = require("child_process");
const ytdl = require("youtube-dl-exec");
const streamSourceService = require("./StreamSourceService");
const {joinVoiceChannel, getVoiceConnection, demuxProbe, createAudioResource} = require("@discordjs/voice");

/**
 * Class representing a voice service.
 */
class VoiceService {

  /**
   * @param {Object} options - options and user settings for voice connection.
   * @param {Client} client - Discord.js client object.
   */
  init(options, client) {
    this.bitRate = options.bitRate;
    this.volume = options.defVolume;
    this.client = client;
    this.youtubeService = streamSourceService.youtubeService;
    this.soundCloudService = streamSourceService.soundCloudService;
    this.spotifyService = streamSourceService.spotifyService;
    this.rawFileService = streamSourceService.rawFileService;
    this.audioProcess = null;
    this.audioStream = null;
    this.streamId = 0;
  }

  /**
   * Plays stream from the given song and return ste stream dispatcher.
   * @param audioPlayer
   * @param {Song} song song to be played
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @returns {Object} - Stream dispatcher.
   */
  playStream(audioPlayer, song, interaction) {
    return new Promise((resolve, reject) => {
      this.getVoiceConnection(interaction).
        then((connection) => {
          connection.subscribe(audioPlayer);
          this.createAudioResource(song).
            then((audioResource) => {
              audioResource.volume.setVolume(this.volume / 100);
              audioPlayer.play(audioResource);
              resolve();
            }).
            catch(reject);
        }).
        catch(reject);
    });

  }

  /**
   * Disconnect current voice connection.
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   */
  disconnectVoiceConnection(interaction) {
    if (typeof interaction.guild === "undefined") {
      return;
    }
    const serverId = interaction.guild.id;
    getVoiceConnection(serverId).destroy();
  }

  /**
   * Establish new voice connection.
   * If a connection is already established disconnect first.
   * @param {ChatInputCommandInteraction} interaction - User interaction this function is invoked by.
   */
  getVoiceConnection(interaction) {
    if (typeof interaction.guild === "undefined") {
      return new Promise((resolve, reject) => {
        reject(new Error("Unable to find discord server!"));
      });
    }
    return new Promise((resolve, reject) => {
      try {
        const connection = joinVoiceChannel({
          "adapterCreator": interaction.guild.voiceAdapterCreator,
          "channelId": interaction.member.voice.channel.id,
          "guildId": interaction.guild.id
        });
        resolve(connection);
      } catch (err) {
        reject(new Error("Unable to join your voice channel!", err));
      }
    });
  }

  /**
   * Check if a voice connection to the server of the message is established.
   * @param {ChatInputCommandInteraction} interaction  - User message this function is invoked by.
   */
  isVoiceConnected(interaction) {
    if (typeof interaction.guild === "undefined") {
      return false;
    }
    const serverId = interaction.guild.id;
    // Search for established connection with this server.
    const voiceConnection = getVoiceConnection(serverId);

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
   * Creates an AudioResource from Song.
   */
  createAudioResource(song) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (song.src === Song.srcType.YT) {
        that.streamId += 1;
        if(that.audioProcess !== null && !that.audioProcess.killed) {
          if(that.audioStream !== null) {
            that.audioStream.destroy();
          }
          that.audioProcess.kill();
        }
        const ytdlpPath = "./node_modules/youtube-dl-exec/bin/yt-dlp.exe";

        that.audioProcess = spawn(ytdlpPath, [
          song.url,
          "-f", "bestaudio/best",
          "-o", "-",
          "-q",
          "-r", "100K"
        ], { stdio: ["ignore", "pipe", "ignore"] });

        that.audioStream = that.audioProcess.stdout;

        const onError = (error) => {
          const id = that.streamId;
          if (id < that.streamId) {
            return;
          }
          if (!that.audioProcess.killed) {
            that.audioProcess.kill();
          }
          that.audioStream.resume();
          reject(error);
        };
        that.audioProcess.
          once("spawn", () => {
            demuxProbe(that.audioStream).
              then((probe) => resolve(createAudioResource(probe.stream, {
                "inlineVolume": true,
                "inputType": probe.type,
                "metadata": song
              }))).
              catch((err) => {
                onError(err);
              });
          }).
          once("error", onError).
          once("close", (code, signal) => {
            console.log(`yt-dlp exited with code ${code}, signal ${signal}`);
          });
      } else {
        const stream = this.getStream(song);
        demuxProbe(stream).
          then((probe) => resolve(createAudioResource(probe.stream, {
            "inlineVolume": true,
            "inputType": probe.type,
            "metadata": song
          }))).
          catch(reject);
      }
    });
  }
}

module.exports = new VoiceService();
